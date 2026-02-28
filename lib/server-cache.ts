/**
 * Multi-Layer Server Cache
 * ========================
 * A unified caching module for all server-side data fetching.
 *
 * Layers:
 *   L1 — In-memory Map with TTL (per API route / getStaticProps)
 *   L2 — Deduplication (in-flight promise sharing)
 *   L3 — Stale-while-revalidate (serve stale, refresh in background)
 *   L4 — ISR revalidation (Next.js page-level, external to this module)
 *   L5 — HTTP Cache-Control headers (CDN/browser, set by caller)
 *
 * Features:
 *   • Tag-based invalidation (e.g. invalidate all "products" entries at once)
 *   • Configurable TTL per entry
 *   • Max entries with LRU eviction
 *   • Dedup concurrent identical requests
 *   • Stale-while-revalidate: returns stale data immediately while refreshing
 *   • Type-safe generic API
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  tags: string[]
  lastAccessed: number
}

interface CacheOptions {
  /** Time-to-live in milliseconds */
  ttl: number
  /** Tags for group invalidation (e.g. ['products', 'listing']) */
  tags?: string[]
  /** Allow returning stale data while revalidating in background */
  staleWhileRevalidate?: boolean
  /** Extra time (ms) a stale entry is considered servable during background refresh */
  staleTTL?: number
}

const DEFAULT_MAX_ENTRIES = 500

class ServerCache {
  private cache = new Map<string, CacheEntry<any>>()
  private inflight = new Map<string, Promise<any>>()
  private maxEntries: number

  constructor(maxEntries = DEFAULT_MAX_ENTRIES) {
    this.maxEntries = maxEntries
  }

  /**
   * Get-or-fetch with full multi-layer logic.
   * If cached & fresh → return immediately (L1).
   * If another call for the same key is in-flight → share that promise (L2).
   * If staleWhileRevalidate & stale data exists → return stale, refresh in bg (L3).
   * Otherwise fetch, cache, return.
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<{ data: T; hit: boolean }> {
    const { ttl, tags = [], staleWhileRevalidate = false, staleTTL } = options
    const now = Date.now()

    // L1: Fresh cache hit
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (entry && now - entry.timestamp < ttl) {
      entry.lastAccessed = now
      return { data: entry.data, hit: true }
    }

    // L3: Stale-while-revalidate — return stale, kick off bg refresh
    const effectiveStaleTTL = staleTTL ?? ttl * 2
    if (staleWhileRevalidate && entry && now - entry.timestamp < effectiveStaleTTL) {
      entry.lastAccessed = now
      // Background refresh (fire-and-forget)
      if (!this.inflight.has(key)) {
        this._backgroundRefresh(key, fetcher, ttl, tags)
      }
      return { data: entry.data, hit: true }
    }

    // L2: Dedup — share in-flight promise
    const existing = this.inflight.get(key)
    if (existing) {
      const data = await existing
      return { data, hit: false }
    }

    // Fetch, cache, return
    const promise = this._fetch(key, fetcher, ttl, tags)
    this.inflight.set(key, promise)

    try {
      const data = await promise
      return { data, hit: false }
    } finally {
      this.inflight.delete(key)
    }
  }

  /**
   * Synchronous check: is the key cached and fresh?
   */
  has(key: string, ttl: number): boolean {
    const entry = this.cache.get(key)
    return !!entry && Date.now() - entry.timestamp < ttl
  }

  /**
   * Synchronous get — returns undefined if missing or stale.
   */
  get<T>(key: string, ttl: number): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (entry && Date.now() - entry.timestamp < ttl) {
      entry.lastAccessed = Date.now()
      return entry.data
    }
    return undefined
  }

  /**
   * Manually set a value in cache.
   */
  set<T>(key: string, data: T, options: CacheOptions): void {
    this._evictIfNeeded()
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      tags: options.tags || [],
      lastAccessed: now,
    })
  }

  /**
   * Invalidate a specific key.
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Invalidate all entries matching a tag.
   * E.g. invalidateByTag('products') clears all product-related cache.
   */
  invalidateByTag(tag: string): number {
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  /**
   * Invalidate all entries.
   */
  clear(): void {
    this.cache.clear()
    this.inflight.clear()
  }

  /**
   * Current cache size (for monitoring).
   */
  get size(): number {
    return this.cache.size
  }

  // ── Internal ──

  private async _fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
    tags: string[]
  ): Promise<T> {
    const data = await fetcher()
    this._evictIfNeeded()
    const now = Date.now()
    this.cache.set(key, { data, timestamp: now, tags, lastAccessed: now })
    return data
  }

  private _backgroundRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
    tags: string[]
  ): void {
    const promise = fetcher()
      .then((data) => {
        const now = Date.now()
        this.cache.set(key, { data, timestamp: now, tags, lastAccessed: now })
      })
      .catch((err) => {
        console.error(`[ServerCache] Background refresh failed for key "${key}":`, err)
        // Keep stale data on failure
      })
      .finally(() => {
        this.inflight.delete(key)
      })
    this.inflight.set(key, promise)
  }

  private _evictIfNeeded(): void {
    if (this.cache.size < this.maxEntries) return

    // LRU eviction: remove the least-recently-accessed entry
    let oldestKey: string | null = null
    let oldestAccess = Infinity
    for (const [k, v] of this.cache.entries()) {
      if (v.lastAccessed < oldestAccess) {
        oldestAccess = v.lastAccessed
        oldestKey = k
      }
    }
    if (oldestKey) this.cache.delete(oldestKey)
  }
}

// ── Singleton instances ──

/** General-purpose server cache for API routes */
export const apiCache = new ServerCache(300)

/** SSG/ISR cache for getStaticProps data (smaller, long-lived) */
export const ssgCache = new ServerCache(100)

// ── Utility: sorted cache key ──

export function makeCacheKey(prefix: string, params: Record<string, any>): string {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return sorted ? `${prefix}:${sorted}` : prefix
}

export { ServerCache }
