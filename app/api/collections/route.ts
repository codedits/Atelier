import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { apiCache, makeCacheKey } from '@/lib/server-cache'

const COLLECTIONS_TTL = 300_000 // 5 minutes

export interface Collection {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    is_active: boolean
    display_order: number
    created_at: string
    updated_at: string
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const is_active = url.searchParams.get('is_active')
    const slug = url.searchParams.get('slug')
    const limit = url.searchParams.get('limit')
    const queryObj = Object.fromEntries(url.searchParams.entries())

    const cacheKey = makeCacheKey('api:collections', queryObj)

    const { data, hit } = await apiCache.getOrFetch<Collection[]>(
        cacheKey,
        async () => {
            let query = supabase
                .from('collections')
                .select('*')
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false })

            if (is_active !== null) {
                query = query.eq('is_active', is_active === 'true')
            } else {
                // Default to only showing active collections for public API
                query = query.eq('is_active', true)
            }

            if (slug) query = query.eq('slug', slug)
            if (limit) query = query.limit(Number(limit))

            const { data, error } = await query
            if (error) throw error
            return (data || []) as Collection[]
        },
        { ttl: COLLECTIONS_TTL, tags: ['collections'], staleWhileRevalidate: true }
    )

    const response = NextResponse.json(data, { status: 200 })
    response.headers.set('X-Cache', hit ? 'HIT' : 'MISS')
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
}
