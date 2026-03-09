import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'
import { revalidateForTag } from '@/lib/revalidation'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  return NextResponse.json(data, { status: 200 })
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  const { id } = await context.params
  const body = await req.json()
  const { name } = body || {}

  // 1. Get old category name to update products
  const { data: oldCategory } = await adminClient
    .from('categories')
    .select('name')
    .eq('id', id)
    .single()

  // 2. Update category
  const { data, error } = await adminClient
    .from('categories')
    .update({ name } as any)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 3. Update products with the new category name if it changed
  if (oldCategory && oldCategory.name !== name) {
    const { error: productError } = await adminClient
      .from('products')
      .update({ category: name } as any)
      .eq('category', oldCategory.name)

    if (productError) console.error('Error updating products category:', productError)
  }

  apiCache.invalidateByTag('categories')
  apiCache.invalidateByTag('products')
  invalidateSSGCache('categories')
  invalidateSSGCache('products')
  revalidateForTag(['categories', 'products'])

  return NextResponse.json(data, { status: 200 })
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  const { id } = await context.params

  // 1. Get category name before deleting
  const { data: category } = await adminClient
    .from('categories')
    .select('name')
    .eq('id', id)
    .single()

  // 2. Delete category
  const { error } = await adminClient
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 3. Update products to have no category
  if (category) {
    const { error: productError } = await adminClient
      .from('products')
      .update({ category: null } as any)
      .eq('category', category.name)

    if (productError) console.error('Error clearing products category:', productError)
  }

  apiCache.invalidateByTag('categories')
  apiCache.invalidateByTag('products')
  invalidateSSGCache('categories')
  invalidateSSGCache('products')
  revalidateForTag(['categories', 'products', 'collections'])

  return NextResponse.json({ message: 'Category deleted' }, { status: 200 })
}