import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default withAdminAuth(async (req, res, { adminClient }) => {
  const { id } = req.query
  const reviewId = String(id)

  if (!adminClient) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
  }

  if (req.method === 'GET') {
    try {
      const { data: review, error } = await adminClient
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

  if (req.method === 'PUT') {
    // Update review (approve/disapprove)
    const { is_approved } = req.body

    if (is_approved === undefined) {
      return res.status(400).json({ error: 'is_approved field is required' })
    }

    try {
      const { data: review, error } = await adminClient
        .from('product_reviews')
        // @ts-ignore - Supabase client without typed schema
        .update({ is_approved: is_approved as boolean })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) throw error

      apiCache.invalidateByTag('reviews')
      invalidateSSGCache('reviews')
      return res.status(200).json(review)
    } catch (error) {
      console.error('Error updating review:', error)
      return res.status(500).json({ error: 'Failed to update review' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await adminClient
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      apiCache.invalidateByTag('reviews')
      invalidateSSGCache('reviews')
      return res.status(200).json({ message: 'Review deleted successfully' })
    } catch (error) {
      console.error('Error deleting review:', error)
      return res.status(500).json({ error: 'Failed to delete review' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
