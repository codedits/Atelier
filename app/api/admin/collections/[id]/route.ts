import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'
import { revalidateForTag } from '@/lib/revalidation'
import { deleteStorageFile } from '@/lib/storage-utils'

type IdContext = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: IdContext) {
    const admin = await getAdminFromNextRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = getSupabaseAdmin()
    if (!adminClient) {
        return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, slug, description, image_url, is_active, display_order, product_ids } = body

    // Fetch existing record to detect image changes
    const { data: existing } = await adminClient
        .from('collections')
        .select('image_url')
        .eq('id', id)
        .single() as any

    // 1. Update Collection Fields
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (image_url !== undefined) updateData.image_url = image_url
    if (is_active !== undefined) updateData.is_active = is_active
    if (display_order !== undefined) updateData.display_order = display_order

    updateData.updated_at = new Date().toISOString()

    const { data: collection, error: collectionError } = await adminClient
        .from('collections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (collectionError) {
        console.error('Error updating collection:', collectionError)
        return NextResponse.json({ error: collectionError.message }, { status: 500 })
    }

    // Delete old image from storage if it changed
    if (existing?.image_url && image_url !== undefined && image_url !== existing.image_url) {
        await deleteStorageFile(adminClient, existing.image_url)
    }

    // 2. Update Collection Products if provided
    if (product_ids && Array.isArray(product_ids)) {
        // Delete existing
        const { error: deleteError } = await adminClient
            .from('collection_products')
            .delete()
            .eq('collection_id', id)

        if (deleteError) {
            console.error('Error clearing old collection products:', deleteError)
        } else if (product_ids.length > 0) {
            // Insert new
            const collectionProducts = product_ids.map((productId: string, index: number) => ({
                collection_id: id,
                product_id: productId,
                display_order: index,
            }))

            const { error: insertError } = await adminClient
                .from('collection_products')
                .insert(collectionProducts)

            if (insertError) {
                console.error('Error inserting new collection products:', insertError)
            }
        }
    }

    apiCache.invalidateByTag('collections')
    invalidateSSGCache('collections')
    revalidateForTag('collections')

    return NextResponse.json(collection, { status: 200 })
}

export async function DELETE(req: NextRequest, { params }: IdContext) {
    const admin = await getAdminFromNextRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = getSupabaseAdmin()
    if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 })

    const { id } = await params

    // Fetch image URL before deleting
    const { data: existing } = await adminClient
        .from('collections')
        .select('image_url')
        .eq('id', id)
        .single() as any

    const { error } = await adminClient
        .from('collections')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting collection:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Delete from storage
    if (existing?.image_url) {
        await deleteStorageFile(adminClient, existing.image_url)
    }

    apiCache.invalidateByTag('collections')
    invalidateSSGCache('collections')
    revalidateForTag('collections')

    return NextResponse.json({ success: true }, { status: 200 })
}
