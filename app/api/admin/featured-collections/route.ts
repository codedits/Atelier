import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateAll } from '@/lib/revalidation'
import { invalidateSSGCache } from '@/lib/cache'
import { deleteStorageFile } from '@/lib/storage-utils'

const COLLECTIONS_TTL = 60_000

// Invalidate all collection caches (SSG + API)
function invalidateCache() {
  invalidateAll('collections')
  apiCache.invalidateByTag('collections')
  invalidateSSGCache('collections')
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

/**
 * GET — reads from the `collections` table (single source of truth).
 * Returns data shaped as { id, title, description, image_url, link, slug, display_order, is_active }
 * so the admin homepage panel can consume it without changes.
 */
export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, hit } = await apiCache.getOrFetch(
      'api:admin:featured-collections',
      async () => {
        const { data, error } = await client
          .from('collections')
          .select('id, name, slug, description, image_url, display_order, is_active')
          .order('display_order', { ascending: true })
        if (error) throw error

        // Map to the shape the admin homepage expects
        return (data || []).map(c => ({
          id: c.id,
          title: c.name,
          slug: c.slug,
          description: c.description || '',
          image_url: c.image_url || '',
          link: `/collections/${c.slug}`,
          display_order: c.display_order,
          is_active: c.is_active,
        }))
      },
      { ttl: COLLECTIONS_TTL, tags: ['collections'], staleWhileRevalidate: true }
    )

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'X-Cache': hit ? 'HIT' : 'MISS',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { title, description, image_url, display_order, is_active } = await req.json()
  if (!title) {
    return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
  }

  const slug = generateSlug(title)

  const { data, error } = await adminClient
    .from('collections')
    .insert([{
      name: title,
      slug,
      description: description || '',
      image_url: image_url || null,
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  invalidateCache()

  // Return in the same shape as GET
  return NextResponse.json({
    ...data,
    title: data.name,
    link: `/collections/${data.slug}`,
  }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { id, title, description, image_url, display_order, is_active, oldImageUrl } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 })

  const updates: any = {}
  if (title !== undefined) {
    updates.name = title
    updates.slug = generateSlug(title)
  }
  if (description !== undefined) updates.description = description
  if (image_url !== undefined) updates.image_url = image_url
  if (display_order !== undefined) updates.display_order = display_order
  if (is_active !== undefined) updates.is_active = is_active
  updates.updated_at = new Date().toISOString()

  const { data, error } = await adminClient
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Delete old image from storage if it changed
  if (oldImageUrl && image_url !== oldImageUrl) {
    await deleteStorageFile(adminClient, oldImageUrl)
  }

  invalidateCache()
  return NextResponse.json({
    ...data,
    title: data.name,
    link: `/collections/${data.slug}`,
  }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 })

  // Fetch image URL before deleting
  const { data: collection } = await adminClient
    .from('collections')
    .select('image_url')
    .eq('id', id)
    .single() as any

  // Remove products from collection first
  await adminClient
    .from('collection_products')
    .delete()
    .eq('collection_id', id)

  const { error } = await adminClient
    .from('collections')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Delete from storage
  if (collection?.image_url) {
    await deleteStorageFile(adminClient, collection.image_url)
  }

  invalidateCache()
  return NextResponse.json({ message: 'Collection deleted' }, { status: 200 })
}