import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default withAdminAuth(async (req, res, { adminClient }) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!adminClient) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  try {
    const { filename, fileData, contentType, folder = 'products' } = req.body

    if (!filename || !fileData) {
      return res.status(400).json({ error: 'Missing required fields: filename, fileData' })
    }

    // Decode base64 file data
    const buffer = Buffer.from(fileData, 'base64')
    
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `${folder}/${timestamp}-${sanitizedFilename}`

    // Determine bucket based on folder
    let bucket = 'product-images'
    if (folder === 'hero') bucket = 'hero-images'
    else if (folder === 'collections') bucket = 'collection-images'

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(key, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return res.status(500).json({ error: uploadError.message })
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from(bucket)
      .getPublicUrl(key)

    if (!urlData) {
      return res.status(500).json({ error: 'Failed to get public URL' })
    }

    return res.status(200).json({
      success: true,
      path: key,
      publicUrl: urlData.publicUrl,
      bucket
    })

  } catch (err: any) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: err.message || 'Upload failed' })
  }
})
