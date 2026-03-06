import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

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

  const { data, error } = await adminClient
    .from('categories')
    .update({ name } as any)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  apiCache.invalidateByTag('categories')
  invalidateSSGCache('categories')
  revalidatePath('/')

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

  const { error } = await adminClient
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  apiCache.invalidateByTag('categories')
  invalidateSSGCache('categories')
  revalidatePath('/')

  return NextResponse.json({ message: 'Category deleted' }, { status: 200 })
}