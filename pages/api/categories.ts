import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Category } from '@/lib/supabase'
import { apiCache } from '@/lib/server-cache'

const CATEGORIES_TTL = 5 * 60_000 // 5 minutes — rarely changes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { data, hit } = await apiCache.getOrFetch<Category[]>(
      'api:categories',
      async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name')
        if (error) throw error
        return (data || []) as Category[]
      },
      { ttl: CATEGORIES_TTL, tags: ['categories'], staleWhileRevalidate: true }
    )

    res.setHeader('X-Cache', hit ? 'HIT' : 'MISS')
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
