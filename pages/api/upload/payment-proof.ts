import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { createReadStream } from 'fs'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const MAX_BYTES = 5 * 1024 * 1024 // 5MB
    const form = formidable({
      maxFileSize: MAX_BYTES,
      maxFiles: 1,
    })

    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Enforce file size server-side as an extra guard (in bytes)
    if (typeof (file.size) === 'number' && file.size > MAX_BYTES) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const extension = file.originalFilename?.split('.').pop() || 'jpg'
    const filename = `payment-proof-${timestamp}-${randomString}.${extension}`

    // Upload to Supabase Storage
    const fileBuffer = require('fs').readFileSync(file.filepath)
    
    // Try to create bucket first if it doesn't exist
    const { error: bucketError } = await supabase.storage
      .from('payment-proofs')
      .list('', { limit: 1 })
    
    if (bucketError && bucketError.message?.includes('Bucket not found')) {
      console.log('Creating payment-proofs bucket...')
      await supabase.storage.createBucket('payment-proofs', { public: true })
    }
    
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .upload(filename, fileBuffer, {
        contentType: file.mimetype || 'image/jpeg',
        cacheControl: '3600',
      })

    if (error) {
      console.error('Upload error:', error)
      return res.status(500).json({ error: 'Failed to upload file' })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(filename)

    return res.status(200).json({
      url: publicUrl,
      filename: filename,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}