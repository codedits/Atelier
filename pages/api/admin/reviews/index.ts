import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const client = supabaseAdmin ?? supabase

  if (req.method === 'GET') {
    // Get all reviews for admin
    const { 
      product_id, 
      is_approved, 
      limit = '50', 
      offset = '0',
      sort = 'created_at',
      order = 'desc'
    } = req.query

    try {
      let query = client
        .from('product_reviews')
        .select('*')
        .order(sort as string, { ascending: order === 'asc' })
        .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

      if (product_id) {
        query = query.eq('product_id', product_id)
      }

      if (is_approved !== undefined) {
        query = query.eq('is_approved', is_approved === 'true')
      }

      const { data: reviews, error } = await query

      if (error) throw error

      // Get total count
      const { count: totalCount, error: countError } = await client
        .from('product_reviews')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      return res.status(200).json({
        reviews: reviews || [],
        total: totalCount || 0
      })
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return res.status(500).json({ error: 'Failed to fetch reviews' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
