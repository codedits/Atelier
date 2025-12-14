import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const reviewId = String(id)
  const client = supabaseAdmin ?? supabase

  if (req.method === 'GET') {
    try {
      const { data: review, error } = await client
        .from('product_reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (error) throw error
      if (!review) {
        return res.status(404).json({ error: 'Review not found' })
      }

      return res.status(200).json(review)
    } catch (error) {
      console.error('Error fetching review:', error)
      return res.status(500).json({ error: 'Failed to fetch review' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
