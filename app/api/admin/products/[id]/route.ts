import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'
import { revalidateForTag } from '@/lib/revalidation'
import { deleteStorageFile, deleteStorageFiles } from '@/lib/storage-utils'

type IdContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, context: IdContext) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = getSupabaseClient()
  const { id } = await context.params
  const productId = String(id)

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (error) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  // Fetch collections
  const { data: cpData } = await client
    .from('collection_products')
    .select('collection_id')
    .eq('product_id', productId)

  const productWithCollections = {
    ...data,
    collection_ids: cpData ? cpData.map(cp => cp.collection_id) : []
  }

  return NextResponse.json(productWithCollections, { status: 200 })
}

export async function PUT(req: NextRequest, context: IdContext) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  const { id } = await context.params
  const productId = String(id)
  const updates = await req.json()

  // Fetch existing product to detect image changes
  const { data: existing } = await adminClient
    .from('products')
    .select('image_url, images')
    .eq('id', productId)
    .single() as any

  delete updates.id
  delete updates.created_at

  if (updates.price !== undefined) updates.price = Number(updates.price)
  if (updates.old_price !== undefined) updates.old_price = updates.old_price ? Number(updates.old_price) : null
  if (updates.stock !== undefined) updates.stock = Number(updates.stock)

  const collectionIds = updates.collection_ids
  delete updates.collection_ids

  const { data, error } = await adminClient
    .from('products')
    // @ts-ignore - Supabase client without typed schema
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Clean up removed images from storage
  if (existing) {
    const oldImages: string[] = existing.images || (existing.image_url ? [existing.image_url] : [])
    const newImages: string[] = updates.images || (updates.image_url ? [updates.image_url] : oldImages)
    const newSet = new Set(newImages)
    const removedUrls = oldImages.filter((url: string) => url && !newSet.has(url))
    if (removedUrls.length > 0) {
      await deleteStorageFiles(adminClient, removedUrls)
    }
  }

  // Update collection mappings
  if (collectionIds !== undefined && Array.isArray(collectionIds)) {
    // 1. Delete existing mappings
    await adminClient.from('collection_products').delete().eq('product_id', productId)

    // 2. Insert new mappings
    if (collectionIds.length > 0) {
      const cpData = collectionIds.map((cId: string) => ({
        product_id: productId,
        collection_id: cId
      }))
      const { error: cpError } = await adminClient.from('collection_products').insert(cpData)
      if (cpError) console.error('Error updating collections:', cpError)
    }
  }

  apiCache.invalidateByTag('products')
  apiCache.invalidateByTag('collections')
  invalidateSSGCache('products')
  invalidateSSGCache('collections')
  revalidateForTag(['products', 'collections'])
  return NextResponse.json(data, { status: 200 })
}

export async function DELETE(req: NextRequest, context: IdContext) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  const { id } = await context.params
  const productId = String(id)

  // Fetch image URLs before deleting
  const { data: existing } = await adminClient
    .from('products')
    .select('image_url, images')
    .eq('id', productId)
    .single() as any

  const { error } = await adminClient
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Delete all product images from storage
  if (existing) {
    const allUrls: string[] = existing.images || (existing.image_url ? [existing.image_url] : [])
    if (allUrls.length > 0) {
      await deleteStorageFiles(adminClient, allUrls)
    }
  }

  apiCache.invalidateByTag('products')
  apiCache.invalidateByTag('collections')
  invalidateSSGCache('products')
  invalidateSSGCache('collections')
  revalidateForTag(['products', 'collections'])
  return NextResponse.json({ message: 'Product deleted' }, { status: 200 })
}