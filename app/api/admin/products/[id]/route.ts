import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminFromNextRequest, getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

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
  return NextResponse.json(data, { status: 200 })
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

  delete updates.id
  delete updates.created_at

  if (updates.price !== undefined) updates.price = Number(updates.price)
  if (updates.old_price !== undefined) updates.old_price = updates.old_price ? Number(updates.old_price) : null
  if (updates.stock !== undefined) updates.stock = Number(updates.stock)

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
  apiCache.invalidateByTag('products')
  invalidateSSGCache('products')
  revalidatePath('/')
  revalidatePath('/products')
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

  const { error } = await adminClient
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  apiCache.invalidateByTag('products')
  invalidateSSGCache('products')
  revalidatePath('/')
  revalidatePath('/products')
  return NextResponse.json({ message: 'Product deleted' }, { status: 200 })
}