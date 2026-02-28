import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '../../../lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false }
  })
}

function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
  }

  try {
    const { filename, contentType, folder = 'products' } = req.body

    if (!filename) {
      return res.status(400).json({ error: 'Missing filename' })
    }

    // Generate unique path
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `${folder}/${timestamp}-${random}-${sanitized}`

    // Determine bucket
    let bucket = 'product-images'
    if (folder === 'hero') bucket = 'hero-images'
    else if (folder === 'collections') bucket = 'collection-images'

    // Ensure bucket exists
    const { error: listError } = await supabaseAdmin.storage.getBucket(bucket)
    if (listError) {
      await supabaseAdmin.storage.createBucket(bucket, { public: true })
    }

    // Create signed upload URL (valid 10 minutes)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(key)

    if (error) {
      console.error('Signed URL error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Build the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(key)

    return res.status(200).json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: key,
      publicUrl: urlData.publicUrl,
      bucket
    })
  } catch (err: any) {
    console.error('Upload URL error:', err)
    return res.status(500).json({ error: err.message || 'Failed to generate upload URL' })
  }
}
