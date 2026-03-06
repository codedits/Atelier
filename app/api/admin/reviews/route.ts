import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseClient } from '@/lib/admin-api-utils'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = getSupabaseClient()
  const searchParams = new URL(req.url).searchParams
  const product_id = searchParams.get('product_id')
  const is_approved = searchParams.get('is_approved')
  const limit = searchParams.get('limit') || '50'
  const offset = searchParams.get('offset') || '0'
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'

  try {
    let query = client
      .from('product_reviews')
      .select('*')
      .order(sort, { ascending: order === 'asc' })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (product_id) {
      query = query.eq('product_id', product_id)
    }

    if (is_approved !== null) {
      query = query.eq('is_approved', is_approved === 'true')
    }

    const { data: reviews, error } = await query
    if (error) throw error

    const { count: totalCount, error: countError } = await client
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })

    if (countError) throw countError

    return NextResponse.json({
      reviews: reviews || [],
      total: totalCount || 0
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}