import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin } from '@/lib/admin-api-utils'

export async function POST(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  try {
    const { filename, fileData, contentType, folder = 'products' } = await req.json()

    if (!filename || !fileData) {
      return NextResponse.json({ error: 'Missing required fields: filename, fileData' }, { status: 400 })
    }

    const buffer = Buffer.from(fileData, 'base64')
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `${folder}/${timestamp}-${sanitizedFilename}`

    let bucket = 'product-images'
    if (folder === 'hero') bucket = 'hero-images'
    else if (folder === 'collections') bucket = 'collection-images'

    const { error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(key, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = adminClient.storage
      .from(bucket)
      .getPublicUrl(key)

    if (!urlData) {
      return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      path: key,
      publicUrl: urlData.publicUrl,
      bucket
    }, { status: 200 })

  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}