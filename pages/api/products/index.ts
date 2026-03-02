import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Product } from '@/lib/supabase'
import { apiCache, makeCacheKey } from '@/lib/server-cache'

const PRODUCTS_TTL = 300_000 // 5 minutes (matches s-maxage)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { category, gender, minPrice, maxPrice, limit, offset, search } = req.query
    const cacheKey = makeCacheKey('api:products', req.query)

    const { data, hit } = await apiCache.getOrFetch<Product[]>(
      cacheKey,
      async () => {
        let query = supabase
          .from('products')
          .select('id, name, slug, price, old_price, category, gender, image_url, images, stock, is_hidden, created_at')
          .order('created_at', { ascending: false })

        // Only show visible products (not hidden)
        query = query.or('is_hidden.is.null,is_hidden.eq.false')

        // Apply filters
        if (search) {
          const searchTerm = String(search).trim()
          // Sanitize input: remove characters that could break FTS or filter syntax
          const sanitized = searchTerm.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim()
          if (sanitized.length > 0) {
            const tsQuery = sanitized.split(/\s+/).filter(Boolean).join(' & ')
            query = query.or(`search_vector.fts.${tsQuery},name.ilike.%${sanitized}%`)
          }
        }
        if (category) query = query.eq('category', category)
        if (gender) query = query.eq('gender', gender)
        if (minPrice) query = query.gte('price', Number(minPrice))
        if (maxPrice) query = query.lte('price', Number(maxPrice))
        if (limit) query = query.limit(Number(limit))
        if (offset) query = query.range(Number(offset), Number(offset) + Number(limit || 10) - 1)

        const { data, error } = await query
        if (error) throw error
        return (data || []) as Product[]
      },
      { ttl: PRODUCTS_TTL, tags: ['products'], staleWhileRevalidate: true }
    )

    res.setHeader('X-Cache', hit ? 'HIT' : 'MISS')
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
