import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, ProductReview } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = supabaseAdmin ?? supabase

  if (req.method === 'GET') {
    // Get reviews for a product
    const { product_id, limit = '10', offset = '0' } = req.query

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' })
    }

    try {
      const { data: reviews, error } = await client
        .from('product_reviews')
        .select('*')
        .eq('product_id', product_id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

      if (error) throw error

      // Get review stats
      const { data: stats, error: statsError } = await client
        .from('product_review_stats')
        .select('*')
        .eq('product_id', product_id)
        .single()

      // Stats might not exist if no reviews
      const reviewStats = stats || {
        product_id,
        review_count: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      }

      return res.status(200).json({
        reviews: reviews || [],
        stats: reviewStats
      })
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return res.status(500).json({ error: 'Failed to fetch reviews' })
    }
  }

  if (req.method === 'POST') {
    // Create a new review
    const { product_id, order_id, user_name, user_email, rating, title, comment } = req.body

    if (!product_id || !order_id || !user_name || !rating || !comment) {
      return res.status(400).json({ 
        error: 'product_id, order_id, user_name, rating, and comment are required' 
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    try {
      // Verify the order exists and is delivered
      const { data: order, error: orderError } = await client
        .from('orders')
        .select('id, status, items')
        .eq('id', order_id)
        .single()

      if (orderError || !order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      if (order.status !== 'delivered') {
        return res.status(400).json({ error: 'Can only review products from delivered orders' })
      }

      // Verify the product was in the order
      const items = order.items as any[]
      const productInOrder = items.some((item: any) => item.product_id === product_id)
      if (!productInOrder) {
        return res.status(400).json({ error: 'Product was not in this order' })
      }

      // Check if review already exists
      const { data: existingReview } = await client
        .from('product_reviews')
        .select('id')
        .eq('product_id', product_id)
        .eq('order_id', order_id)
        .single()

      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this product from this order' })
      }

      // Create the review
      const { data: review, error: insertError } = await client
        .from('product_reviews')
        .insert({
          product_id,
          order_id,
          user_name,
          user_email,
          rating,
          title: title || null,
          comment,
          is_verified_purchase: true,
          is_approved: true // Auto-approve for now, can add moderation later
        })
        .select()
        .single()

      if (insertError) throw insertError

      return res.status(201).json(review)
    } catch (error: any) {
      console.error('Error creating review:', error)
      if (error.code === '23505') {
        return res.status(400).json({ error: 'You have already reviewed this product from this order' })
      }
      return res.status(500).json({ error: 'Failed to create review' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
