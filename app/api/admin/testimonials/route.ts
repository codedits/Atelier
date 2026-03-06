import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

const TESTIMONIALS_TTL = 60_000

function invalidateCache() {
  apiCache.invalidateByTag('testimonials')
  invalidateSSGCache('testimonials')
}

export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, hit } = await apiCache.getOrFetch(
      'api:admin:testimonials',
      async () => {
        const { data, error } = await client
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
        if (error) throw error
        return data || []
      },
      { ttl: TESTIMONIALS_TTL, tags: ['testimonials'], staleWhileRevalidate: true }
    )

    const response = NextResponse.json(data, { status: 200 })
    response.headers.set('X-Cache', hit ? 'HIT' : 'MISS')
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    return response
  } catch (err: any) {
    console.error('Testimonials fetch error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { customer_name, content, rating, display_order, is_active } = await req.json()
  if (!customer_name || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await adminClient
    .from('testimonials')
    .insert([{
      customer_name,
      content,
      rating: rating || 5,
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true
    }] as any)
    .select()
    .single()

  if (error) {
    console.error('Testimonial creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  invalidateCache()
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { id, customer_name, content, rating, display_order, is_active } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing testimonial ID' }, { status: 400 })
  }

  const updates: any = {}
  if (customer_name !== undefined) updates.customer_name = customer_name
  if (content !== undefined) updates.content = content
  if (rating !== undefined) updates.rating = rating
  if (display_order !== undefined) updates.display_order = display_order
  if (is_active !== undefined) updates.is_active = is_active

  const { data, error } = await (adminClient as any)
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Testimonial update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  invalidateCache()
  return NextResponse.json(data, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing testimonial ID' }, { status: 400 })
  }

  const { error } = await adminClient
    .from('testimonials')
    .delete()
    .eq('id', String(id))

  if (error) {
    console.error('Testimonial deletion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  invalidateCache()
  return NextResponse.json({ message: 'Testimonial deleted' }, { status: 200 })
}