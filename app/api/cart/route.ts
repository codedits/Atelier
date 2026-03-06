import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromNextRequest } from '@/lib/user-auth'

async function getAuthenticatedUserId(req: NextRequest) {
  return getUserFromNextRequest(req)?.id || null
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const userId = await getAuthenticatedUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { data: cartItems, error } = await supabase
      .from('user_cart')
      .select(`
        id,
        quantity,
        created_at,
        product:products (
          id,
          name,
          price,
          old_price,
          image_url,
          stock,
          is_hidden
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cart:', error)
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
    }

    const items = (cartItems || [])
      .filter((item: any) => item.product && !item.product.is_hidden)
      .map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product: item.product,
      }))

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    )

    return NextResponse.json({
      items,
      subtotal,
      itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    }, { status: 200 })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const userId = await getAuthenticatedUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await req.json()
  const { productId, quantity = 1 } = body

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  if (typeof quantity !== 'number' || quantity < 1) {
    return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 })
  }

  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock, is_hidden')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.is_hidden) {
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 })
    }

    const { data: existingItem } = await supabase
      .from('user_cart')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity

      if (product.stock > 0 && newQuantity > product.stock) {
        return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 })
      }

      const { error: updateError } = await supabase
        .from('user_cart')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Cart updated' }, { status: 200 })
    }

    if (product.stock > 0 && quantity > product.stock) {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 })
    }

    const { error: insertError } = await supabase
      .from('user_cart')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })

    if (insertError) {
      console.error('Cart insert error:', insertError)
      return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Added to cart' }, { status: 201 })
  } catch (error) {
    console.error('Cart add error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Cart cleared' }, { status: 200 })
  } catch (error) {
    console.error('Cart clear error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}