import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseClient } from '@/lib/admin-api-utils'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = getSupabaseClient()
  const { data, error } = await client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}