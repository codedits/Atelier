import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'
import { revalidateForTag } from '@/lib/revalidation'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const client = getSupabaseClient()

  // 1. Fetch all categories
  const { data: categories, error } = await client
    .from('categories')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 2. Fetch product counts grouped by category name
  const { data: counts, error: countError } = await client
    .from('products')
    .select('category')

  if (countError) {
    console.error('Error fetching category counts:', countError)
    return NextResponse.json(categories, { status: 200 })
  }

  // 3. Map counts to categories
  const countMap: Record<string, number> = {}
  counts.forEach((p: any) => {
    if (p.category) {
      countMap[p.category] = (countMap[p.category] || 0) + 1
    }
  })

  const formattedData = categories.map((c: any) => ({
    ...c,
    product_count: countMap[c.name] || 0
  }))

  return NextResponse.json(formattedData, { status: 200 })
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
  revalidateForTag('categories')

  return NextResponse.json(data, { status: 201 })
}