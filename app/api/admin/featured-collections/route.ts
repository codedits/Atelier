import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateAll } from '@/lib/revalidation'
import type { SupabaseClient } from '@supabase/supabase-js'

const COLLECTIONS_TTL = 60_000

// Helper function to delete file from Supabase Storage
async function deleteStorageFile(adminClient: SupabaseClient, imageUrl: string, folder: string = 'collections') {
  if (!imageUrl) return
  try {
    const urlParts = imageUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    if (!filename) return
    await adminClient.storage.from('images').remove([`${folder}/${filename}`])
  } catch (error) {
    console.warn('Failed to delete old image file:', error)
  }
}

// Invalidate cache when data changes
function invalidateCache() {
  invalidateAll('featured_collections')
}

export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, hit } = await apiCache.getOrFetch(
      'api:admin:featured-collections',
      async () => {
        const { data, error } = await client
          .from('featured_collections')
          .select('*')
          .order('display_order', { ascending: true })
        if (error) {
          const msg = error?.message || String(error)
          if (/find the table|does not exist|relation .* does not exist/i.test(msg)) {
            return []
          }
          throw error
        }
        return data || []
      },
      { ttl: COLLECTIONS_TTL, tags: ['featured_collections'], staleWhileRevalidate: true }
    )

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'X-Cache': hit ? 'HIT' : 'MISS',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    })
  } catch (err: any) {
    const msg = err?.message || String(err)
    if (/find the table|does not exist|relation .* does not exist/i.test(msg)) {
      return NextResponse.json([], { status: 200 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { title, description, image_url, link, display_order, is_active } = await req.json()
  if (!title || !image_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await adminClient
    .from('featured_collections')
    .insert([{ title, description: description || '', image_url, link: link || '/products', display_order: display_order || 0, is_active: is_active !== undefined ? is_active : true }] as any)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  invalidateCache()
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { id, title, description, image_url, link, display_order, is_active, oldImageUrl } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 })

  const updates: any = {}
  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (image_url !== undefined) updates.image_url = image_url
  if (link !== undefined) updates.link = link
  if (display_order !== undefined) updates.display_order = display_order
  if (is_active !== undefined) updates.is_active = is_active

  const { data, error } = await adminClient
    .from('featured_collections')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (oldImageUrl && image_url !== oldImageUrl) {
    await deleteStorageFile(adminClient, oldImageUrl, 'collections')
  }

  invalidateCache()
  return NextResponse.json(data, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 })

  const { data: collection } = await adminClient
    .from('featured_collections')
    .select('image_url')
    .eq('id', id)
    .single() as any

  const { error } = await adminClient
    .from('featured_collections')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (collection?.image_url) {
    await deleteStorageFile(adminClient, collection.image_url, 'collections')
  }

  invalidateCache()
  return NextResponse.json({ message: 'Collection deleted' }, { status: 200 })
}