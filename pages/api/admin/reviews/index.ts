import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'

export default withAdminAuth(async (req, res, { client }) => {
  if (req.method === 'GET') {
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
})
