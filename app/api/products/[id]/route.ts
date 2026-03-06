import { NextRequest, NextResponse } from 'next/server'

import { supabase, Product } from '@/lib/supabase'
import { apiCache } from '@/lib/server-cache'

const PRODUCT_TTL = 600_000 // 10 minutes (matches s-maxage)

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
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
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const response = NextResponse.json(data, { status: 200 })
  response.headers.set('X-Cache', hit ? 'HIT' : 'MISS')
  response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
  return response
}