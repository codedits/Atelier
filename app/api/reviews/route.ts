import { NextRequest, NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { apiCache } from '@/lib/server-cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

const REVIEWS_TTL = 600_000 // 10 minutes (matches s-maxage)

export async function GET(req: NextRequest) {
  const client = supabaseAdmin ?? supabase
  const url = new URL(req.url)
  const product_id = url.searchParams.get('product_id')
  const limit = url.searchParams.get('limit') || '10'
  const offset = url.searchParams.get('offset') || '0'

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  const cacheKey = `api:reviews:${product_id}:${limit}:${offset}`

  try {
    const { data, hit } = await apiCache.getOrFetch(
      cacheKey,
      async () => {
        const { data: reviews, error } = await client
          .from('product_reviews')
          .select('id, product_id, order_id, user_name, rating, title, comment, is_verified_purchase, is_approved, created_at')
          .eq('product_id', product_id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

        if (error) throw error

        const { data: stats } = await client
          .from('product_review_stats')
          .select('product_id, review_count, average_rating, five_star, four_star, three_star, two_star, one_star')
          .eq('product_id', product_id)
          .single()

        return {
          reviews: reviews || [],
          stats: stats || {
            product_id,
            review_count: 0,
            average_rating: 0,
            five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0
          }
        }
      },
      { ttl: REVIEWS_TTL, tags: ['reviews', `reviews:${product_id}`], staleWhileRevalidate: true }
    )

    const response = NextResponse.json(data, { status: 200 })
    response.headers.set('X-Cache', hit ? 'HIT' : 'MISS')
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    return response
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const client = supabaseAdmin ?? supabase
  const body = await req.json()
  const { product_id, order_id, user_name, user_email, rating, title, comment } = body

  if (!product_id || !order_id || !user_name || !rating || !comment) {
    return NextResponse.json({
      error: 'product_id, order_id, user_name, rating, and comment are required'
    }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  try {
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('id, status, items')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'delivered') {
      return NextResponse.json({ error: 'Can only review products from delivered orders' }, { status: 400 })
    }

      // Verify the product was in the order
    const items = order.items as any[]
    const productInOrder = items.some((item: any) => item.product_id === product_id)
    if (!productInOrder) {
      return NextResponse.json({ error: 'Product was not in this order' }, { status: 400 })
    }

      // Check if review already exists
    const { data: existingReview } = await client
      .from('product_reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('order_id', order_id)
      .single()

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product from this order' }, { status: 400 })
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
        is_approved: false
      })
      .select()
      .single()

    if (insertError) throw insertError

    apiCache.invalidateByTag(`reviews:${product_id}`)
    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('Error creating review:', error)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already reviewed this product from this order' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}