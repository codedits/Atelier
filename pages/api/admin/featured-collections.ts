import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'
import { supabase as supabaseAnon } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
}

// Simple in-memory cache for public GET requests
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 60 seconds

function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

// Helper function to delete file from Supabase Storage
async function deleteStorageFile(imageUrl: string, folder: string = 'collections') {
  if (!imageUrl || !supabaseAdmin) return

  try {
    // Extract filename from URL
    // URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]/[filename]
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

// Invalidate cache when data changes
function invalidateCache() {
  cache.delete('featured-collections')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET is public (for frontend)
  if (req.method === 'GET') {
    try {
      // Check cache first
      const cached = cache.get('featured-collections')
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.setHeader('X-Cache', 'HIT')
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
        return res.status(200).json(cached.data)
      }

      const client = supabaseAdmin ?? supabaseAnon
      const { data, error } = await client
        .from('featured_collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        const msg = error?.message || String(error)
        console.error('Featured collections fetch error:', error)
        // If the table doesn't exist yet in the Supabase project, return an empty list
        // so the frontend doesn't crash. Recommend running the SQL setup to create tables.
        if (/find the table|does not exist|relation .* does not exist/i.test(msg)) {
          console.warn('Featured collections table missing in DB; returning empty array')
          return res.status(200).json([])
        }
        return res.status(500).json({ error: msg })
      }
      
      // Store in cache
      cache.set('featured-collections', { data: data || [], timestamp: Date.now() })
      
      res.setHeader('X-Cache', 'MISS')
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
      return res.status(200).json(data || [])
    } catch (err: any) {
        const msg = err?.message || String(err)
        console.error('Featured collections fetch error:', err)
        if (/find the table|does not exist|relation .* does not exist/i.test(msg)) {
          console.warn('Featured collections table missing in DB; returning empty array')
          return res.status(200).json([])
        }
        return res.status(500).json({ error: msg })
      }
  }

  // All other methods require admin auth
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'POST') {
    const { title, description, image_url, link, display_order, is_active } = req.body

    if (!title || !image_url) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await supabaseAdmin
      .from('featured_collections')
      .insert([{
        title,
        description: description || '',
        image_url,
        link: link || '/products',
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true
      }] as any)
      .select()
      .single()

    if (error) {
      console.error('Collection creation error:', error)
      return res.status(500).json({ error: error.message })
    }
    return res.status(201).json(data)
  }

  if (req.method === 'PUT') {
    const { id, title, description, image_url, link, display_order, is_active, oldImageUrl } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Missing collection ID' })
    }

    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (image_url !== undefined) updates.image_url = image_url
    if (link !== undefined) updates.link = link
    if (display_order !== undefined) updates.display_order = display_order
    if (is_active !== undefined) updates.is_active = is_active

    const { data, error } = await supabaseAdmin
      .from('featured_collections')
      // @ts-ignore - Supabase client without typed schema
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Collection update error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Delete old image if a new one was uploaded
    if (oldImageUrl && image_url !== oldImageUrl) {
      await deleteStorageFile(oldImageUrl, 'collections')
    }

    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Missing collection ID' })
    }

    // Get the collection to retrieve the image URL before deletion
    const { data: collection } = await supabaseAdmin
      .from('featured_collections')
      .select('image_url')
      .eq('id', String(id))
      .single() as any

    const { error } = await supabaseAdmin
      .from('featured_collections')
      .delete()
      .eq('id', String(id))

    if (error) {
      console.error('Collection deletion error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Delete the image file from storage
    if (collection?.image_url) {
      await deleteStorageFile(collection.image_url, 'collections')
    }

    return res.status(200).json({ message: 'Collection deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
