import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'
import type { SupabaseClient } from '@supabase/supabase-js'

const COLLECTIONS_TTL = 60_000

// Helper function to delete file from Supabase Storage
async function deleteStorageFile(adminClient: SupabaseClient, imageUrl: string, folder: string = 'collections') {
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

// Invalidate cache when data changes
function invalidateCache() {
  apiCache.invalidateByTag('featured_collections')
  invalidateSSGCache('featured_collections')
}

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  // GET is public (for frontend)
  if (req.method === 'GET') {
    try {
      const { data, hit } = await apiCache.getOrFetch(
        'api:admin:featured-collections',
        async () => {
          const { data, error } = await client
            .from('featured_collections')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
          if (error) {
            const msg = error?.message || String(error)
            if (/find the table|does not exist|relation .* does not exist/i.test(msg)) {
              console.warn('Featured collections table missing in DB; returning empty array')
              return []
            }
            throw error
          }
          return data || []
        },
        { ttl: COLLECTIONS_TTL, tags: ['featured_collections'], staleWhileRevalidate: true }
      )

      res.setHeader('X-Cache', hit ? 'HIT' : 'MISS')
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
      return res.status(200).json(data)
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

  if (!adminClient) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })

  if (req.method === 'POST') {
    const { title, description, image_url, link, display_order, is_active } = req.body

    if (!title || !image_url) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await adminClient
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
    invalidateCache()
    try { await res.revalidate('/') } catch {}
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

    const { data, error } = await adminClient
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
      await deleteStorageFile(adminClient, oldImageUrl, 'collections')
    }

    invalidateCache()
    try { await res.revalidate('/') } catch {}
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Missing collection ID' })
    }

    // Get the collection to retrieve the image URL before deletion
    const { data: collection } = await adminClient
      .from('featured_collections')
      .select('image_url')
      .eq('id', String(id))
      .single() as any

    const { error } = await adminClient
      .from('featured_collections')
      .delete()
      .eq('id', String(id))

    if (error) {
      console.error('Collection deletion error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Delete the image file from storage
    if (collection?.image_url) {
      await deleteStorageFile(adminClient, collection.image_url, 'collections')
    }

    invalidateCache()
    try { await res.revalidate('/') } catch {}
    return res.status(200).json({ message: 'Collection deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}, { allowPublicMethods: ['GET'] })
