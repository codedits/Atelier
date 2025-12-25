import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Product } from '@/lib/supabase'

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 seconds

function getCacheKey(query: Record<string, any>): string {
  return JSON.stringify(query)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Query params for filtering
    const { category, gender, minPrice, maxPrice, limit, offset, search } = req.query
    const cacheKey = getCacheKey(req.query)

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT')
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
      return res.status(200).json(cached.data)
    }

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    // Only show visible products (not hidden) - check if column exists first
    // If is_hidden column doesn't exist, this will be ignored by Supabase
    try {
      query = query.or('is_hidden.is.null,is_hidden.eq.false')
    } catch (e) {
      // Column doesn't exist yet, continue without filter
    }

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (gender) {
      query = query.eq('gender', gender)
    }
    if (minPrice) {
      query = query.gte('price', Number(minPrice))
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice))
    }
    if (limit) {
      query = query.limit(Number(limit))
    }
    if (offset) {
      query = query.range(Number(offset), Number(offset) + Number(limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Products fetch error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Store in cache
    cache.set(cacheKey, { data: data as Product[], timestamp: Date.now() })

    // Set cache headers for CDN/browser
    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    return res.status(200).json(data as Product[])
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
