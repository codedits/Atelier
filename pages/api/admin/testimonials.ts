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

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 60 seconds

function invalidateCache() {
  cache.delete('testimonials')
}

function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET is public (for frontend)
  if (req.method === 'GET') {
    try {
      // Check cache first
      const cached = cache.get('testimonials')
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.setHeader('X-Cache', 'HIT')
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
        return res.status(200).json(cached.data)
      }

      const client = supabaseAdmin ?? supabaseAnon
      const { data, error } = await client
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Testimonials fetch error:', error)
        return res.status(500).json({ error: error.message })
      }
      
      // Store in cache
      cache.set('testimonials', { data: data || [], timestamp: Date.now() })
      
      res.setHeader('X-Cache', 'MISS')
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
      return res.status(200).json(data || [])
    } catch (err: any) {
      console.error('Testimonials fetch error:', err)
      return res.status(500).json({ error: err.message })
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
    const { customer_name, content, rating, display_order, is_active } = req.body

    if (!customer_name || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await supabaseAdmin
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
    
    invalidateCache() // Clear cache on update
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

    const { data, error } = await (supabaseAdmin as any)
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Testimonial update error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    invalidateCache() // Clear cache on update
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Missing testimonial ID' })
    }

    const { error } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', String(id))

    if (error) {
      console.error('Testimonial deletion error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    invalidateCache() // Clear cache on update
    return res.status(200).json({ message: 'Testimonial deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
