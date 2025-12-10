import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Product } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Query params for filtering
    const { category, gender, minPrice, maxPrice, limit, offset } = req.query

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    // Only show visible products (not hidden) - check if column exists first
    // If is_hidden column doesn't exist, this will be ignored by Supabase
    try {
      query = query.or('is_hidden.is.null,is_hidden.eq.false')
    } catch (e) {
      // Column doesn't exist yet, continue without filter
    }

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (gender) {
      query = query.eq('gender', gender)
    }
    if (minPrice) {
      query = query.gte('price', Number(minPrice))
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice))
    }
    if (limit) {
      query = query.limit(Number(limit))
    }
    if (offset) {
      query = query.range(Number(offset), Number(offset) + Number(limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Products fetch error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data as Product[])
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
