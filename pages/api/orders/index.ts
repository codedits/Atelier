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
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json(orders)
    } catch (error) {
      console.error('Orders fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // POST - Create a new order
  if (req.method === 'POST') {
    const user = getUserFromRequest(req)
    const { user_name, email, phone, address, items, total_price, payment_method, clearCart } = req.body

    // Validate required fields
    if (!user_name || !phone || !address || !items || !total_price || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' })
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

    // Validate stock availability for all items
    const productIds = items.map((item: any) => item.product_id).filter(Boolean)
    if (productIds.length > 0) {
      const { data: products, error: stockError } = await supabase
        .from('products')
        .select('id, name, stock')
        .in('id', productIds)

      if (stockError) {
        return res.status(500).json({ error: 'Failed to validate stock' })
      }

      const productMap = new Map(products?.map(p => [p.id, p]) || [])
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
      }
    }

    const newOrder: Record<string, unknown> = {
      user_name,
      phone,
      address,
      items: items as OrderItem[],
      total_price: Number(total_price),
      payment_method,
      payment_status: 'pending',
      status: 'pending',
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

    // Reduce stock for ordered products
    for (const item of items) {
      if (item.product_id && item.quantity > 0) {
        // Try RPC first, fall back to direct update
        const { error: rpcError } = await supabase.rpc('decrement_stock', {
          p_id: item.product_id,
          qty: item.quantity,
        })
        
        if (rpcError) {
          // If RPC doesn't exist, do manual update with raw SQL
          await supabase
            .from('products')
            .update({ stock: Math.max(0, (item.stock || 0) - item.quantity) })
            .eq('id', item.product_id)
        }
      }
    }

    // Clear cart if user is authenticated and clearCart is true
    if (user && clearCart) {
      await supabase.from('user_cart').delete().eq('user_id', user.id)
    }

    // Send order confirmation email
    if (email) {
      try {
        await sendOrderConfirmationEmail({
          to: email,
          orderId: data.id,
          userName: user_name,
          items: items as any[],
          totalPrice: Number(total_price),
          paymentMethod: payment_method,
          address,
          phone,
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the order creation if email fails - it's not critical
      }
    }

    return res.status(201).json(data as Order)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
