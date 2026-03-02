import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'

export default withAdminAuth(async (req, res, { adminClient }) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!adminClient) {
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
    else if (folder === 'lookbook') bucket = 'lookbook-images'

    // Ensure bucket exists
    const { error: listError } = await adminClient.storage.getBucket(bucket)
    if (listError) {
      await adminClient.storage.createBucket(bucket, { public: true })
    }

    // Create signed upload URL (valid 10 minutes)
    const { data, error } = await adminClient.storage
      .from(bucket)
      .createSignedUploadUrl(key)

    if (error) {
      console.error('Signed URL error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Build the public URL
    const { data: urlData } = adminClient.storage
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
})
