import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { invalidateAll } from '@/lib/revalidation'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = getSupabaseClient()
  const { data, error } = await client
    .from('store_settings')
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const settings: Record<string, string> = {}
  data?.forEach((s: any) => { settings[s.key] = s.value })

  return NextResponse.json(settings, { status: 200 })
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  const updates = await req.json() as Record<string, string>
  const errors: string[] = []

  for (const [key, value] of Object.entries(updates)) {
    const { error } = await (adminClient as any)
      .from('store_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) errors.push(`${key}: ${error.message}`)
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: `Failed to update: ${errors.join(', ')}` }, { status: 500 })
  }

  invalidateAll(['store_settings', 'site_config'])

  return NextResponse.json({ message: 'Settings updated' }, { status: 200 })
}