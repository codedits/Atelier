import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Product } from '@/lib/supabase'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 60 seconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'GET') {
    const cacheKey = `product-${id}`
    
    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT')
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
      return res.status(200).json(cached.data)
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Store in cache
    cache.set(cacheKey, { data: data as Product, timestamp: Date.now() })

    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return res.status(200).json(data as Product)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
