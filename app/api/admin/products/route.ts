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
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  const { name, description, price, old_price, category, gender, image_url, images, stock, is_hidden, is_featured, collection_ids } = await req.json()

  if (!name || !description || price === undefined || !category || !gender || !image_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const productData: any = {
    name,
    description,
    price: Number(price),
    old_price: old_price ? Number(old_price) : null,
    category,
    gender,
    image_url,
    images: images || [],
    stock: Number(stock) || 0,
  }

  if (is_hidden !== undefined) {
    productData.is_hidden = is_hidden
  }
  if (is_featured !== undefined) {
    productData.is_featured = is_featured
  }

  const { data, error } = await adminClient
    .from('products')
    .insert([productData] as any)
    .select()
    .single()

  if (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert collection mappings if provided
  if (collection_ids && Array.isArray(collection_ids) && collection_ids.length > 0) {
    const cpData = collection_ids.map((cId: string) => ({
      product_id: data.id,
      collection_id: cId
    }))
    const { error: cpError } = await adminClient.from('collection_products').insert(cpData)
    if (cpError) console.error('Error assigning collections:', cpError)
  }

  apiCache.invalidateByTag('products')
  apiCache.invalidateByTag('collections')
  invalidateSSGCache('products')
  invalidateSSGCache('collections')
  revalidateForTag(['products', 'collections'])
  return NextResponse.json(data, { status: 201 })
}