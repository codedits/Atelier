import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const client = getSupabaseClient()
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  const body = await req.json()
  const { name } = body || {}

  if (!name) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
  }

  const { data, error } = await adminClient
    .from('categories')
    .insert([{ name }] as any)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  apiCache.invalidateByTag('categories')
  invalidateSSGCache('categories')
  revalidatePath('/')

  return NextResponse.json(data, { status: 201 })
}