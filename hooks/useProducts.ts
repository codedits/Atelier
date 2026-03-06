import { useState, useEffect, useCallback, useRef } from 'react'
import { Product } from '@/lib/supabase'

interface UseProductsOptions {
  category?: string
  gender?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  search?: string
}

/**
 * Client-side cache shared across all useProducts/useProduct instances.
 * Entries expire after CLIENT_CACHE_TTL so we don't show stale data
 * forever, but within the TTL window, navigation between pages is instant.
 */
const CLIENT_CACHE_TTL = 60_000 // 1 minute
const clientCache = new Map<string, { data: unknown; ts: number }>()

function getCached<T>(key: string): T | undefined {
  const entry = clientCache.get(key)
  if (entry && Date.now() - entry.ts < CLIENT_CACHE_TTL) return entry.data as T
  return undefined
}

function setCache<T>(key: string, data: T) {
  clientCache.set(key, { data, ts: Date.now() })
  // Evict old entries if cache grows too large
  if (clientCache.size > 200) {
    const oldest = clientCache.keys().next().value as string
    clientCache.delete(oldest)
  }
}

function makeKey(prefix: string, opts: Record<string, any>): string {
  const parts = Object.keys(opts)
    .filter(k => opts[k] !== undefined && opts[k] !== null && opts[k] !== '')
    .sort()
    .map(k => `${k}=${opts[k]}`)
    .join('&')
  return parts ? `${prefix}:${parts}` : prefix
}

export function useProducts(options: UseProductsOptions = {}) {
  const cacheKey = makeKey('products', options)
  const cachedData = getCached<Product[]>(cacheKey)

  // Initialize state from cache if available — no loading flicker
  const [products, setProducts] = useState<Product[]>(cachedData || [])
  const [loading, setLoading] = useState(!cachedData)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchProducts = useCallback(async () => {
    // Abort previous in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // If we have cached data, show it immediately (no loading state)
    const cached = getCached<Product[]>(cacheKey)
    if (cached) {
      setProducts(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)

    const params = new URLSearchParams()
    if (options.category) params.set('category', options.category)
    if (options.gender) params.set('gender', options.gender)
    if (options.minPrice !== undefined) params.set('minPrice', String(options.minPrice))
    if (options.maxPrice !== undefined) params.set('maxPrice', String(options.maxPrice))
    if (options.limit) params.set('limit', String(options.limit))
    if (options.search) params.set('search', options.search)

    try {
      const res = await fetch(`/api/products?${params}`, { signal: controller.signal })
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      if (!controller.signal.aborted) {
        setProducts(data)
        setCache(cacheKey, data)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [cacheKey, options.category, options.gender, options.minPrice, options.maxPrice, options.limit, options.search])

  useEffect(() => {
    fetchProducts()
    return () => abortRef.current?.abort()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

export function useProduct(id: string | undefined) {
  const cacheKey = id ? `product:${id}` : ''
  const cachedData = id ? getCached<Product>(cacheKey) : undefined

  const [product, setProduct] = useState<Product | null>(cachedData || null)
  const [loading, setLoading] = useState(!cachedData && !!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    // Show cached data immediately
    const cached = getCached<Product>(`product:${id}`)
    if (cached) {
      setProduct(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }

    const fetchProduct = async () => {
      setError(null)

      try {
        const res = await fetch(`/api/products/${id}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        if (!controller.signal.aborted) {
          setProduct(data)
          setCache(`product:${id}`, data)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    // If we had cached data, still revalidate in background (stale-while-revalidate)
    fetchProduct()

    return () => controller.abort()
  }, [id])

  return { product, loading, error }
}
