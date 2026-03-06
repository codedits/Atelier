import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminFromNextRequest, getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { invalidateSSGCache } from '@/lib/cache'

export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error) throw error
    return NextResponse.json(data || [], { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  try {
    const { text, link, link_text, icon, display_order, is_active } = await req.json()
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

    const { data, error } = await (adminClient as any)
      .from('announcements')
      .insert([{ text, link, link_text, icon: icon || 'sparkle', display_order: display_order || 0, is_active: is_active !== false }])
      .select()
      .single()
    if (error) throw error

    invalidateSSGCache('announcements')
    revalidatePath('/')
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data, error } = await (adminClient as any)
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    invalidateSSGCache('announcements')
    revalidatePath('/')
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id query param required' }, { status: 400 })

    const { error } = await (adminClient as any)
      .from('announcements')
      .delete()
      .eq('id', id)
    if (error) throw error

    invalidateSSGCache('announcements')
    revalidatePath('/')
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}