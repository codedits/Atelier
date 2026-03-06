import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromNextRequest } from '@/lib/user-auth'

async function getAuthenticatedUserId(req: NextRequest) {
  return getUserFromNextRequest(req)?.id || null
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const userId = await getAuthenticatedUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await req.json()
  const { quantity } = body

  if (typeof quantity !== 'number' || quantity < 0) {
    return NextResponse.json({ error: 'Quantity must be a non-negative number' }, { status: 400 })
  }

  try {
    const { data: cartItem, error: fetchError } = await supabase
      .from('user_cart')
      .select('id, product_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    if (quantity === 0) {
      await supabase.from('user_cart').delete().eq('id', id)
      return NextResponse.json({ success: true, message: 'Item removed from cart' }, { status: 200 })
    }

    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', cartItem.product_id)
      .single()

    if (product && product.stock > 0 && quantity > product.stock) {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('user_cart')
      .update({ quantity })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Cart updated' }, { status: 200 })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const userId = await getAuthenticatedUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Item removed from cart' }, { status: 200 })
  } catch (error) {
    console.error('Cart delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}