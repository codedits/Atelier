import type { NextApiRequest, NextApiResponse } from 'next'
import { Order, OrderItem } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromRequest } from '@/lib/user-auth'
import { sendOrderConfirmationEmail } from '@/lib/email'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  // GET - List orders for authenticated user
  if (req.method === 'GET') {
    const user = getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, user_name, phone, address, email, items, total_price, payment_method, payment_status, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.setHeader('Cache-Control', 'private, s-maxage=0, max-age=30')
      return res.status(200).json(orders)
    } catch (error) {
      console.error('Orders fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // POST - Create a new order
  if (req.method === 'POST') {
    const user = getUserFromRequest(req)
    const { user_name, email, phone, address, items, total_price, payment_method, payment_proof, clearCart } = req.body

    // Validate required fields
    if (!user_name || !phone || !address || !items || !total_price || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate payment proof for COD orders
    if (payment_method === 'COD') {
      if (!payment_proof || !payment_proof.transaction_id || !payment_proof.screenshot_url) {
        return res.status(400).json({ error: 'Payment proof required for COD orders' })
      }
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' })
      }
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' })
    }

    // Validate stock availability and get real prices from database
    const productIds = items.map((item: any) => item.product_id).filter(Boolean)
    if (productIds.length === 0) {
      return res.status(400).json({ error: 'Order items must have valid product IDs' })
    }

    const { data: products, error: stockError } = await supabase
      .from('products')
      .select('id, name, stock, price')
      .in('id', productIds)

    if (stockError) {
      return res.status(500).json({ error: 'Failed to validate stock' })
    }

    const productMap = new Map(products?.map(p => [p.id, p]) || [])

    // Validate stock AND recalculate total from real prices (prevent price tampering)
    let serverCalculatedTotal = 0
    for (const item of items) {
      if (!item.product_id) continue
      const product = productMap.get(item.product_id)
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.name}` })
      }
      // Only check stock if product has limited stock (stock > 0 means limited)
      if (product.stock > 0 && item.quantity > product.stock) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` })
      }
      serverCalculatedTotal += product.price * item.quantity
    }

    const newOrder: Record<string, unknown> = {
      user_name,
      phone,
      address,
      items: items as OrderItem[],
      total_price: serverCalculatedTotal, // Use server-calculated price, not client-supplied
      payment_method,
      payment_status: payment_method === 'COD' ? 'proof_pending' : 'pending',
      status: 'pending',
    }

    // Add payment proof data for COD orders
    if (payment_method === 'COD' && payment_proof) {
      newOrder.payment_proof = {
        transaction_id: payment_proof.transaction_id,
        payment_method: payment_proof.payment_method,
        screenshot_url: payment_proof.screenshot_url,
        delivery_fee_paid: payment_proof.delivery_fee_paid,
        uploaded_at: new Date().toISOString()
      }
      // Update payment status since proof is provided
      newOrder.payment_status = 'proof_submitted'
    }

    // Add email if provided
    if (email) {
      newOrder.email = email
    }

    // If user is authenticated, link order to user
    if (user) {
      newOrder.user_id = user.id
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Reduce stock for ordered products — atomic, race-condition-safe
    const stockUpdates = items
      .filter((item: any) => item.product_id && item.quantity > 0)
      .map((item: any) => ({ id: item.product_id, qty: item.quantity }))

    if (stockUpdates.length > 0) {
      // Use the safe batch RPC (all-or-nothing with WHERE stock >= qty guard)
      const { data: batchResult, error: rpcError } = await supabase.rpc(
        'decrement_stock_batch_safe',
        { updates: JSON.stringify(stockUpdates) }
      )

      if (rpcError) {
        // Fallback: try individual safe decrements
        for (const update of stockUpdates) {
          const { data: ok, error: singleErr } = await supabase.rpc(
            'decrement_stock_safe',
            { p_id: update.id, qty: update.qty }
          )

          if (singleErr || ok === false) {
            // Stock was insufficient — the order row already exists so
            // we leave it as-is (status: pending) for manual review.
            console.warn(
              `Stock decrement failed for product ${update.id} (qty ${update.qty}):`,
              singleErr?.message ?? 'insufficient stock'
            )
          }
        }
      } else if (batchResult && batchResult.success === false) {
        // Batch reported insufficient stock for one product
        console.warn(
          `Batch stock decrement failed for product ${batchResult.failed_product_id}. Available: ${batchResult.available}`
        )
      }
    }

    // Clear cart if user is authenticated and clearCart is true
    if (user && clearCart) {
      const { error: cartError } = await supabase.from('user_cart').delete().eq('user_id', user.id)
      if (cartError) {
        console.error('Failed to clear cart:', cartError)
      }
    }

    // Send order confirmation email
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
        // Don't fail the order creation if email fails - it's not critical
      }
    }

    return res.status(201).json({ ...data, message: 'Order created successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
