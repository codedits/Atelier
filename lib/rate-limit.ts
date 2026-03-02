/**
 * Rate Limiter — Upstash Redis (serverless-safe)
 * ================================================
 * Uses @upstash/ratelimit with a sliding-window algorithm backed by
 * Upstash Redis.  Falls back to an in-memory Map when the env vars
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set
 * (local dev / preview deploys).
 *
 * Required env vars for production:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ── Upstash Redis singleton ──

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

// ── In-memory fallback (dev / preview) ──
// Implements the minimal subset of the Redis interface that @upstash/ratelimit uses.

const memStore = new Map<string, { value: string; expireAt?: number }>()

function makeInMemoryRedis() {
  const store = memStore

  const self = {
    eval: undefined,
    evalsha: undefined,
    async hset(key: string, values: Record<string, unknown>) {
      const now = Date.now()
      const existing = store.get(key)
      const obj = existing && (!existing.expireAt || existing.expireAt > now)
        ? JSON.parse(existing.value)
        : {}
      for (const [k, v] of Object.entries(values)) obj[k] = v
      store.set(key, { value: JSON.stringify(obj), expireAt: existing?.expireAt })
      return 'OK'
    },
    async hgetall(key: string) {
      const entry = store.get(key)
      if (!entry) return null
      if (entry.expireAt && entry.expireAt <= Date.now()) { store.delete(key); return null }
      return JSON.parse(entry.value)
    },
    async expire(key: string, seconds: number) {
      const entry = store.get(key)
      if (entry) entry.expireAt = Date.now() + seconds * 1000
      return 1
    },
    async sadd(_key: string, ..._members: string[]) { return 0 },
    async multi() {
      const ops: (() => Promise<unknown>)[] = []
      const chain: any = {
        hset: (key: string, values: Record<string, unknown>) => { ops.push(() => self.hset(key, values)); return chain },
        expire: (key: string, s: number) => { ops.push(() => self.expire(key, s)); return chain },
        exec: async () => { const r = []; for (const fn of ops) r.push(await fn()); return r },
        hgetall: (key: string) => { ops.push(() => self.hgetall(key)); return chain },
      }
      return chain
    },
  }
  return self as unknown as ConstructorParameters<typeof Ratelimit>[0]['redis']
}

const inMemoryRedis = makeInMemoryRedis()

// ── Public API (drop-in replacement for old interface) ──

export interface RateLimitOptions {
  /** Time window in milliseconds */
  interval: number
  /** Max requests per window */
  maxRequests: number
}

// Cache Ratelimit instances per options-key so we don't recreate them
const limiters = new Map<string, Ratelimit>()

function getLimiter(options: RateLimitOptions): Ratelimit {
  const cacheKey = `${options.interval}:${options.maxRequests}`
  const existing = limiters.get(cacheKey)
  if (existing) return existing

  const r = getRedis()

  const limiter = new Ratelimit({
    redis: r ?? inMemoryRedis,                     // in-memory fallback for dev
    limiter: Ratelimit.slidingWindow(
      options.maxRequests,
      `${options.interval} ms` as any              // Upstash accepts ms duration
    ),
    analytics: false,
    prefix: 'rl',
  })

  limiters.set(cacheKey, limiter)
  return limiter
}

export function rateLimit(options: RateLimitOptions) {
  return {
    check: async (
      identifier: string
    ): Promise<{ success: boolean; remaining: number }> => {
      const limiter = getLimiter(options)
      const { success, remaining } = await limiter.limit(identifier)
      return { success, remaining }
    },
  }
}

// Helper to get client IP
export function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  )
}

// Re-export Redis singleton for other modules that may need it (e.g. cache)
export { getRedis }
