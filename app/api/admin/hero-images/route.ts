import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { invalidateSSGCache } from '@/lib/cache'
import type { SupabaseClient } from '@supabase/supabase-js'

// Helper function to delete file from Supabase Storage
async function deleteStorageFile(adminClient: SupabaseClient, imageUrl: string, folder: string = 'hero') {
  if (!imageUrl) return
  try {
    const urlParts = imageUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    if (!filename) return
    await adminClient.storage.from('images').remove([`${folder}/${filename}`])
  } catch (error) {
    console.warn('Failed to delete old image file:', error)
  }
}

export async function GET() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('hero_images')
      .select('*')
      .eq('is_active', true)
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
    invalidateSSGCache('hero_images')
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

    if (oldImageUrl && image_url !== oldImageUrl) {
      await deleteStorageFile(adminClient, oldImageUrl, 'hero')
    }

    invalidateSSGCache('hero_images')
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

    if (heroImage?.image_url) {
      await deleteStorageFile(adminClient, heroImage.image_url, 'hero')
    }

    invalidateSSGCache('hero_images')
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}