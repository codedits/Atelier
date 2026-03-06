import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyUserToken } from '@/lib/user-token'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

export async function POST(req: NextRequest) {
  const token = req.cookies.get('atelier_user_token')?.value
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const MAX_BYTES = 5 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type || '')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const extension = file.name?.split('.').pop() || 'jpg'
    const filename = `payment-proof-${timestamp}-${randomString}.${extension}`

    const { error: bucketError } = await supabase.storage
      .from('payment-proofs')
      .list('', { limit: 1 })

    if (bucketError && bucketError.message?.includes('Bucket not found')) {
      await supabase.storage.createBucket('payment-proofs', { public: true })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await supabase.storage
      .from('payment-proofs')
      .upload(filename, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
      })

    if (error) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('payment-proofs').getPublicUrl(filename)

    return NextResponse.json({
      url: publicUrl,
      filename,
      message: 'File uploaded successfully',
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
