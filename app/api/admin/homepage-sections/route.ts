import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { invalidateAll } from '@/lib/revalidation'

export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('homepage_sections')
      .select('*')
      .order('section_key')
      .order('display_order')
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
    const body = await req.json()
    const { id, section_key, title, subtitle, content, image_url, cta_text, cta_link, metadata, is_active, display_order } = body

    if (!section_key) {
      return NextResponse.json({ error: 'section_key is required' }, { status: 400 })
    }

    // If an id is provided, update by id (for existing rows)
    if (id) {
      const updateData: any = {
        section_key,
        title,
        subtitle,
        content,
        image_url,
        cta_text,
        cta_link,
        is_active: is_active !== undefined ? is_active : true,
      }
      if (metadata !== undefined) updateData.metadata = metadata
      if (display_order !== undefined) updateData.display_order = display_order

      const { data, error } = await (adminClient as any)
        .from('homepage_sections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      invalidateAll('homepage_sections')
      return NextResponse.json(data, { status: 200 })
    }

    // No id — upsert by (section_key, display_order) for new rows
    const upsertData: any = {
      section_key,
      title,
      subtitle,
      content,
      image_url,
      cta_text,
      cta_link,
      is_active: is_active !== undefined ? is_active : true,
      display_order: display_order ?? 0,
    }
    if (metadata !== undefined) upsertData.metadata = metadata

    const { data, error } = await (adminClient as any)
      .from('homepage_sections')
      .upsert(upsertData, { onConflict: 'section_key,display_order' })
      .select()
      .single()

    if (error) throw error
    invalidateAll('homepage_sections')
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { section_key, title, subtitle, content, image_url, cta_text, cta_link, metadata, is_active, display_order } = body

    if (!section_key) {
      return NextResponse.json({ error: 'section_key is required' }, { status: 400 })
    }

    const insertData: any = {
      section_key,
      title: title || '',
      subtitle: subtitle || '',
      content: content || '',
      image_url: image_url || '',
      cta_text: cta_text || '',
      cta_link: cta_link || '',
      is_active: is_active !== undefined ? is_active : true,
      display_order: display_order ?? 0,
      metadata: metadata || {},
    }

    const { data, error } = await (adminClient as any)
      .from('homepage_sections')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error
    invalidateAll('homepage_sections')
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await (adminClient as any)
      .from('homepage_sections')
      .delete()
      .eq('id', id)

    if (error) throw error
    invalidateAll('homepage_sections')
    return NextResponse.json({ message: 'Section deleted' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}