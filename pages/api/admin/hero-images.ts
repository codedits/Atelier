import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '../../../lib/admin-auth'
import { supabase as supabaseAnon } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

// Helper function to delete file from Supabase Storage
async function deleteStorageFile(imageUrl: string, folder: string = 'hero') {
  if (!imageUrl || !supabaseAdmin) return

  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    
    if (!filename) return

    await supabaseAdmin.storage
      .from('images')
      .remove([`${folder}/${filename}`])
  } catch (error) {
    console.warn('Failed to delete old image file:', error)
    // Don't fail the request if file deletion fails
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Public access, POST/PUT/DELETE - Admin only
  if (req.method === 'GET') {
    try {
      // Use anon client for public reads if service role not configured
      const client = supabaseAdmin ?? supabaseAnon
      const { data, error } = await client
        .from('hero_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      return res.status(200).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  // Admin auth required for modifications
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'POST') {
    try {
      const { title, subtitle, image_url, cta_text, cta_link, display_order } = req.body

      const { data, error } = await supabaseAdmin
        .from('hero_images')
        .insert({
          title,
          subtitle,
          image_url,
          cta_text,
          cta_link,
          display_order: display_order || 0,
          is_active: true
        } as any)
        .select()
        .single()

      if (error) throw error
      return res.status(201).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, title, subtitle, image_url, cta_text, cta_link, display_order, is_active, oldImageUrl } = req.body

      if (!id) {
        return res.status(400).json({ error: 'ID is required' })
      }

      const { data, error } = await supabaseAdmin
        .from('hero_images')
        // @ts-ignore - Supabase client without typed schema
        .update({
          title,
          subtitle,
          image_url,
          cta_text,
          cta_link,
          display_order,
          is_active
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Delete old image if a new one was uploaded
      if (oldImageUrl && image_url !== oldImageUrl) {
        await deleteStorageFile(oldImageUrl, 'hero')
      }

      return res.status(200).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'ID is required' })
      }

      // Get the hero image to retrieve the image URL before deletion
      const { data: heroImage } = await supabaseAdmin
        .from('hero_images')
        .select('image_url')
        .eq('id', String(id))
        .single()

      const { error } = await supabaseAdmin
        .from('hero_images')
        .delete()
        .eq('id', String(id))

      if (error) throw error

      // Delete the image file from storage
      if (heroImage?.image_url) {
        await deleteStorageFile(heroImage.image_url, 'hero')
      }

      return res.status(200).json({ success: true })
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
