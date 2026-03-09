import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'
import { revalidateForTag } from '@/lib/revalidation'

export async function GET(req: NextRequest) {
    const admin = await getAdminFromNextRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = getSupabaseClient()
    const { data, error } = await client
        .from('collections')
        .select('*, products:collection_products(count)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Map counts to a cleaner format
    const formattedData = data.map((c: any) => ({
        ...c,
        product_count: c.products?.[0]?.count || 0
    }))

    return NextResponse.json(formattedData, { status: 200 })
}

export async function POST(req: NextRequest) {
    const admin = await getAdminFromNextRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = getSupabaseAdmin()
    if (!adminClient) {
        return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
    }

    const { name, slug, description, image_url, is_active, display_order, product_ids } = await req.json()

    if (!name || !slug) {
        return NextResponse.json({ error: 'Missing required fields (name, slug)' }, { status: 400 })
    }

    // 1. Create the Collection
    const collectionData: any = {
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
    }

    if (is_active !== undefined) collectionData.is_active = is_active
    if (display_order !== undefined) collectionData.display_order = display_order

    const { data: collection, error: collectionError } = await adminClient
        .from('collections')
        .insert([collectionData])
        .select()
        .single()

    if (collectionError) {
        console.error('Collection creation error:', collectionError)
        return NextResponse.json({ error: collectionError.message }, { status: 500 })
    }

    // 2. Add products to the collection (if provided)
    if (product_ids && Array.isArray(product_ids) && product_ids.length > 0) {
        const collectionProducts = product_ids.map((productId: string, index: number) => ({
            collection_id: collection.id,
            product_id: productId,
            display_order: index,
        }))

        const { error: cpError } = await adminClient
            .from('collection_products')
            .insert(collectionProducts)

        if (cpError) {
            console.error('Collection products mapping error:', cpError)
            // Non-fatal, return the collection but log the error
        }
    }

    // Clear caches
    apiCache.invalidateByTag('collections')
    invalidateSSGCache('collections')
    revalidateForTag('collections')

    return NextResponse.json(collection, { status: 201 })
}
