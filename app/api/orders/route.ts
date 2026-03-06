import { NextRequest, NextResponse } from 'next/server'

import { Order, OrderItem } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromNextRequest } from '@/lib/user-auth'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const user = getUserFromNextRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_name, phone, address, email, items, total_price, payment_method, payment_status, status, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response = NextResponse.json(orders, { status: 200 })
    response.headers.set('Cache-Control', 'private, s-maxage=0, max-age=30')
    return response
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const user = getUserFromNextRequest(req)
  const body = await req.json()
  const { user_name, email, phone, address, items, total_price, payment_method, payment_proof, clearCart } = body

  if (!user_name || !phone || !address || !items || !total_price || !payment_method) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (payment_method === 'COD') {
    if (!payment_proof || !payment_proof.transaction_id || !payment_proof.screenshot_url) {
      return NextResponse.json({ error: 'Payment proof required for COD orders' }, { status: 400 })
    }
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
  }

  const productIds = items.map((item: any) => item.product_id).filter(Boolean)
  if (productIds.length === 0) {
    return NextResponse.json({ error: 'Order items must have valid product IDs' }, { status: 400 })
  }

  const { data: products, error: stockError } = await supabase
    .from('products')
    .select('id, name, stock, price')
    .in('id', productIds)

  if (stockError) {
    return NextResponse.json({ error: 'Failed to validate stock' }, { status: 500 })
  }

  const productMap = new Map(products?.map(p => [p.id, p]) || [])

  let serverCalculatedTotal = 0
  for (const item of items) {
    if (!item.product_id) continue
    const product = productMap.get(item.product_id)
    if (!product) {
      return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 })
    }
    if (product.stock > 0 && item.quantity > product.stock) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` }, { status: 400 })
    }
    serverCalculatedTotal += product.price * item.quantity
  }

  const newOrder: Record<string, unknown> = {
    user_name,
    phone,
    address,
    items: items as OrderItem[],
    total_price: serverCalculatedTotal,
    payment_method,
    payment_status: payment_method === 'COD' ? 'proof_pending' : 'pending',
    status: 'pending',
  }

  if (payment_method === 'COD' && payment_proof) {
    newOrder.payment_proof = {
      transaction_id: payment_proof.transaction_id,
      payment_method: payment_proof.payment_method,
      screenshot_url: payment_proof.screenshot_url,
      delivery_fee_paid: payment_proof.delivery_fee_paid,
      uploaded_at: new Date().toISOString()
    }
    newOrder.payment_status = 'proof_submitted'
  }

  if (email) {
    newOrder.email = email
  }

  if (user) {
    newOrder.user_id = user.id
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([newOrder])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const stockUpdates = items
    .filter((item: any) => item.product_id && item.quantity > 0)
    .map((item: any) => ({ id: item.product_id, qty: item.quantity }))

  if (stockUpdates.length > 0) {
    const { data: batchResult, error: rpcError } = await supabase.rpc(
      'decrement_stock_batch_safe',
      { updates: JSON.stringify(stockUpdates) }
    )

    if (rpcError) {
      for (const update of stockUpdates) {
        const { data: ok, error: singleErr } = await supabase.rpc(
          'decrement_stock_safe',
          { p_id: update.id, qty: update.qty }
        )

        if (singleErr || ok === false) {
          console.warn(
            `Stock decrement failed for product ${update.id} (qty ${update.qty}):`,
            singleErr?.message ?? 'insufficient stock'
          )
        }
      }
    } else if (batchResult && batchResult.success === false) {
      console.warn(
        `Batch stock decrement failed for product ${batchResult.failed_product_id}. Available: ${batchResult.available}`
      )
    }
  }

  if (user && clearCart) {
    const { error: cartError } = await supabase.from('user_cart').delete().eq('user_id', user.id)
    if (cartError) {
      console.error('Failed to clear cart:', cartError)
    }
  }

  if (email) {
    try {
      await sendOrderConfirmationEmail({
        to: email,
        orderId: data.id,
        userName: user_name,
        items: items as any[],
        totalPrice: serverCalculatedTotal,
        paymentMethod: payment_method,
        address,
        phone,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }
  }

  return NextResponse.json({ ...data, message: 'Order created successfully' }, { status: 201 })
}
