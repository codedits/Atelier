import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin } from '@/lib/admin-api-utils'

export async function POST(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  try {
    const { filename, folder = 'products' } = await req.json()

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 })
    }

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `${folder}/${timestamp}-${random}-${sanitized}`

    let bucket = 'product-images'
    if (folder === 'hero') bucket = 'hero-images'
    else if (folder === 'collections') bucket = 'collection-images'
    else if (folder === 'lookbook') bucket = 'lookbook-images'
    else if (folder === 'feature_video') bucket = 'feature-videos'

    const { error: listError } = await adminClient.storage.getBucket(bucket)
    if (listError) {
      await adminClient.storage.createBucket(bucket, { public: true })
    }

    const { data, error } = await adminClient.storage
      .from(bucket)
      .createSignedUploadUrl(key)

    if (error) {
      console.error('Signed URL error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = adminClient.storage
      .from(bucket)
      .getPublicUrl(key)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: key,
      publicUrl: urlData.publicUrl,
      bucket
    }, { status: 200 })
  } catch (err: any) {
    console.error('Upload URL error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate upload URL' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  try {
    const { url, folder = 'feature_video' } = await req.json()
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    let bucket = 'product-images'
    if (folder === 'hero') bucket = 'hero-images'
    else if (folder === 'collections') bucket = 'collection-images'
    else if (folder === 'lookbook') bucket = 'lookbook-images'
    else if (folder === 'feature_video') bucket = 'feature-videos'

    // Extract path from public URL
    const urlParts = url.split('/')
    const filename = urlParts[urlParts.length - 1]

    if (filename) {
      await adminClient.storage.from(bucket).remove([`${folder}/${filename}`])
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    console.error('Delete file error:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete file' }, { status: 500 })
  }
}