import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin } from '@/lib/admin-api-utils'
import { invalidateAll } from '@/lib/revalidation'

type IdContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, context: IdContext) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  const { id } = await context.params
  const reviewId = String(id)

  try {
    const { data: review, error } = await adminClient
      .from('product_reviews')
      .select('*')
      .eq('id', reviewId)
      .single()

    if (error) throw error
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(review, { status: 200 })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: IdContext) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  const { id } = await context.params
  const reviewId = String(id)
  const { is_approved } = await req.json()

  if (is_approved === undefined) {
    return NextResponse.json({ error: 'is_approved field is required' }, { status: 400 })
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

    invalidateAll('reviews')
    return NextResponse.json(review, { status: 200 })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: IdContext) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

  const { id } = await context.params
  const reviewId = String(id)

  try {
    const { error } = await adminClient
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)

    if (error) throw error

    invalidateAll('reviews')
    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}