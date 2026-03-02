import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

const TESTIMONIALS_TTL = 60_000

function invalidateCache() {
  apiCache.invalidateByTag('testimonials')
  invalidateSSGCache('testimonials')
}

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  // GET is public (for frontend)
  if (req.method === 'GET') {
    try {
      const { data, hit } = await apiCache.getOrFetch(
        'api:admin:testimonials',
        async () => {
          const { data, error } = await client
            .from('testimonials')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
          if (error) throw error
          return data || []
        },
        { ttl: TESTIMONIALS_TTL, tags: ['testimonials'], staleWhileRevalidate: true }
      )

      res.setHeader('X-Cache', hit ? 'HIT' : 'MISS')
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
      return res.status(200).json(data)
    } catch (err: any) {
      console.error('Testimonials fetch error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  if (!adminClient) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })

  if (req.method === 'POST') {
    const { customer_name, content, rating, display_order, is_active } = req.body

    if (!customer_name || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await adminClient
      .from('testimonials')
      .insert([{
        customer_name,
        content,
        rating: rating || 5,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true
      }] as any)
      .select()
      .single()

    if (error) {
      console.error('Testimonial creation error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    invalidateCache()
    return res.status(201).json(data)
  }

  if (req.method === 'PUT') {
    const { id, customer_name, content, rating, display_order, is_active } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Missing testimonial ID' })
    }

    const updates: any = {}
    if (customer_name !== undefined) updates.customer_name = customer_name
    if (content !== undefined) updates.content = content
    if (rating !== undefined) updates.rating = rating
    if (display_order !== undefined) updates.display_order = display_order
    if (is_active !== undefined) updates.is_active = is_active

    const { data, error } = await (adminClient as any)
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Testimonial update error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    invalidateCache()
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Missing testimonial ID' })
    }

    const { error } = await adminClient
      .from('testimonials')
      .delete()
      .eq('id', String(id))

    if (error) {
      console.error('Testimonial deletion error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    invalidateCache()
    return res.status(200).json({ message: 'Testimonial deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}, { allowPublicMethods: ['GET'] })
