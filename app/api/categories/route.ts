import { NextResponse } from 'next/server'

import { supabase, Category } from '@/lib/supabase'
import { apiCache } from '@/lib/server-cache'

const CATEGORIES_TTL = 5 * 60_000 // 5 minutes -- rarely changes

export async function GET() {
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

  const response = NextResponse.json(data, { status: 200 })
  response.headers.set('X-Cache', hit ? 'HIT' : 'MISS')
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  return response
}