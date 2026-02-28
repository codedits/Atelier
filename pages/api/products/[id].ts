import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Product } from '@/lib/supabase'
import { apiCache } from '@/lib/server-cache'

const PRODUCT_TTL = 600_000 // 10 minutes (matches s-maxage)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'GET') {
    const cacheKey = `api:product:${id}`

    const { data, hit } = await apiCache.getOrFetch<Product | null>(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        if (error) return null
        return data as Product
      },
      { ttl: PRODUCT_TTL, tags: ['products'], staleWhileRevalidate: true }
    )

    if (!data) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.setHeader('X-Cache', hit ? 'HIT' : 'MISS')
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
