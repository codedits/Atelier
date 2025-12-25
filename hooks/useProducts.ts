import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/lib/supabase'

interface UseProductsOptions {
  category?: string
  gender?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  search?: string
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (options.category) params.set('category', options.category)
    if (options.gender) params.set('gender', options.gender)
    if (options.minPrice !== undefined) params.set('minPrice', String(options.minPrice))
    if (options.maxPrice !== undefined) params.set('maxPrice', String(options.maxPrice))
    if (options.limit) params.set('limit', String(options.limit))
    if (options.search) params.set('search', options.search)

    try {
      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [options.category, options.gender, options.minPrice, options.maxPrice, options.limit, options.search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}
