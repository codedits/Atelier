import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
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

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  // GET - public
  if (req.method === 'GET') {
    try {
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

  if (!adminClient) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })

  if (req.method === 'POST') {
    try {
      const { title, subtitle, image_url, cta_text, cta_link, display_order } = req.body
      const { data, error } = await adminClient
        .from('hero_images')
        .insert({
          title, subtitle, image_url, cta_text, cta_link,
          display_order: display_order || 0,
          is_active: true
        } as any)
        .select()
        .single()
      if (error) throw error
      invalidateSSGCache('hero_images')
      return res.status(201).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, title, subtitle, image_url, cta_text, cta_link, display_order, is_active, oldImageUrl } = req.body
      if (!id) return res.status(400).json({ error: 'ID is required' })

      const { data, error } = await adminClient
        .from('hero_images')
        // @ts-ignore - Supabase client without typed schema
        .update({ title, subtitle, image_url, cta_text, cta_link, display_order, is_active })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      if (oldImageUrl && image_url !== oldImageUrl) {
        await deleteStorageFile(adminClient, oldImageUrl, 'hero')
      }

      invalidateSSGCache('hero_images')
      return res.status(200).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'ID is required' })

      const { data: heroImage } = await adminClient
        .from('hero_images')
        .select('image_url')
        .eq('id', String(id))
        .single() as any

      const { error } = await adminClient
        .from('hero_images')
        .delete()
        .eq('id', String(id))
      if (error) throw error

      if (heroImage?.image_url) {
        await deleteStorageFile(adminClient, heroImage.image_url, 'hero')
      }

      invalidateSSGCache('hero_images')
      return res.status(200).json({ success: true })
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}, { allowPublicMethods: ['GET'] })
