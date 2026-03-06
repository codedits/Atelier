import { NextRequest, NextResponse } from 'next/server'

import { supabase, Product } from '@/lib/supabase'
import { apiCache, makeCacheKey } from '@/lib/server-cache'

const PRODUCTS_TTL = 300_000 // 5 minutes (matches s-maxage)

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const category = url.searchParams.get('category')
    const gender = url.searchParams.get('gender')
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const limit = url.searchParams.get('limit')
    const offset = url.searchParams.get('offset')
    const search = url.searchParams.get('search')
    const queryObj = Object.fromEntries(url.searchParams.entries())
    const cacheKey = makeCacheKey('api:products', queryObj)

  const { data, hit } = await apiCache.getOrFetch<Product[]>(
    cacheKey,
    async () => {
      let query = supabase
        .from('products')
        .select('id, name, slug, price, old_price, category, gender, image_url, images, stock, is_hidden, created_at')
        .order('created_at', { ascending: false })

      query = query.or('is_hidden.is.null,is_hidden.eq.false')

      if (search) {
        const searchTerm = String(search).trim()
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

  const response = NextResponse.json(data, { status: 200 })
  response.headers.set('X-Cache', hit ? 'HIT' : 'MISS')
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  return response
}