import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { invalidateAll } from '@/lib/revalidation'
import { deleteStorageFile } from '@/lib/storage-utils'

export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('hero_images')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) throw error
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  try {
    const { title, subtitle, image_url, cta_text, cta_link, display_order } = await req.json()
    const { data, error } = await adminClient
      .from('hero_images')
      .insert({ title, subtitle, image_url, cta_text, cta_link, display_order: display_order || 0, is_active: true } as any)
      .select()
      .single()
    if (error) throw error
    invalidateAll('hero_images')
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  try {
    const { id, title, subtitle, image_url, cta_text, cta_link, display_order, is_active, oldImageUrl } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const { data, error } = await adminClient
      .from('hero_images')
      .update({ title, subtitle, image_url, cta_text, cta_link, display_order, is_active } as any)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    // Delete old image from storage if it changed
    if (oldImageUrl && image_url !== oldImageUrl) {
      await deleteStorageFile(adminClient, oldImageUrl)
    }

    invalidateAll('hero_images')
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    // Fetch image URL before deleting the record
    const { data: heroImage } = await adminClient
      .from('hero_images')
      .select('image_url')
      .eq('id', id)
      .single() as any

    const { error } = await adminClient
      .from('hero_images')
      .delete()
      .eq('id', id)
    if (error) throw error

    // Delete from storage
    if (heroImage?.image_url) {
      await deleteStorageFile(adminClient, heroImage.image_url)
    }

    invalidateAll('hero_images')
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}