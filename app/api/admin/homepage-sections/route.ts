import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('homepage_sections')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return NextResponse.json(data || [], { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  try {
    const { section_key, title, subtitle, content, image_url, cta_text, cta_link, metadata, is_active } = await req.json()

    if (!section_key) {
      return NextResponse.json({ error: 'section_key is required' }, { status: 400 })
    }

    const upsertData: any = {
      section_key,
      title,
      subtitle,
      content,
      image_url,
      cta_text,
      cta_link,
      is_active: is_active !== undefined ? is_active : true,
    }
    if (metadata !== undefined) {
      upsertData.metadata = metadata
    }

    const { data, error } = await (adminClient as any)
      .from('homepage_sections')
      .upsert(upsertData, { onConflict: 'section_key' })
      .select()
      .single()

    if (error) throw error

    const { invalidateSSGCache } = await import('@/lib/cache')
    invalidateSSGCache('homepage_sections')
    revalidatePath('/')

    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}