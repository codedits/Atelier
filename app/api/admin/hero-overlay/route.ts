import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { invalidateSSGCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('site_config')
      .select('features')
      .limit(1)
      .single()
    if (error) throw error
    return NextResponse.json(data?.features?.hero?.overlay || {}, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
  }

  try {
    const { color, opacity, gradient_from, gradient_to, gradient_enabled } = await req.json()

    const { data: current } = await adminClient
      .from('site_config')
      .select('id, features')
      .limit(1)
      .single() as { data: any }

    if (!current) return NextResponse.json({ error: 'No site_config found' }, { status: 404 })

    const features = current.features || {}
    features.hero = features.hero || {}
    features.hero.overlay = {
      color: color || '#000000',
      opacity: opacity ?? 40,
      gradient_from: gradient_from ?? 60,
      gradient_to: gradient_to ?? 20,
      gradient_enabled: gradient_enabled !== false,
    }

    const { error } = await (adminClient as any)
      .from('site_config')
      .update({ features })
      .eq('id', current.id)

    if (error) throw error

    invalidateSSGCache('site_config')
    revalidatePath('/')
    return NextResponse.json(features.hero.overlay, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}