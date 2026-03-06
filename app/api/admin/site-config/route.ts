import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminFromNextRequest, getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = getSupabaseClient()
  const { data, error } = await client
    .from('site_config')
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
  }

  const { homepage_layout, nav_menu, theme_colors, features } = await req.json()

  const { data: existing, error: fetchError } = await adminClient
    .from('site_config')
    .select('id')
    .single() as { data: any, error: any }

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'site_config row not found' }, { status: 500 })
  }

  const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() }
  if (homepage_layout !== undefined) updatePayload.homepage_layout = homepage_layout
  if (nav_menu !== undefined) updatePayload.nav_menu = nav_menu
  if (theme_colors !== undefined) updatePayload.theme_colors = theme_colors
  if (features !== undefined) updatePayload.features = features

  const { error } = await (adminClient as any)
    .from('site_config')
    .update(updatePayload)
    .eq('id', existing.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  apiCache.invalidateByTag('site_config')
  invalidateSSGCache('site_config')
  revalidatePath('/')

  return NextResponse.json({ message: 'Site config updated' }, { status: 200 })
}