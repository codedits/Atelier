import type { NextApiResponse } from 'next'
import { withUserAuth, AuthenticatedRequest } from '@/lib/user-auth-middleware'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const userId = req.user.id

  // GET - List cart items
  if (req.method === 'GET') {
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
        return res.status(500).json({ error: 'Failed to fetch cart' })
      }

      // Filter out hidden products and format response
      const items = (cartItems || [])
        .filter((item: any) => item.product && !item.product.is_hidden)
        .map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          product: item.product,
        }))

      // Calculate totals
      const subtotal = items.reduce(
        (sum: number, item: any) => sum + item.product.price * item.quantity,
        0
      )

      return res.status(200).json({
        items,
        subtotal,
        itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      })
    } catch (error) {
      console.error('Cart fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // POST - Add item to cart
  if (req.method === 'POST') {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be a positive number' })
    }

    try {
      // Check if product exists and is available
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock, is_hidden')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      if (product.is_hidden) {
        return res.status(400).json({ error: 'Product is not available' })
      }

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from('user_cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity

        // Check stock
        if (product.stock > 0 && newQuantity > product.stock) {
          return res.status(400).json({ error: 'Not enough stock available' })
        }

        const { error: updateError } = await supabase
          .from('user_cart')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)

        if (updateError) {
          return res.status(500).json({ error: 'Failed to update cart' })
        }

        return res.status(200).json({ success: true, message: 'Cart updated' })
      }

      // Check stock for new item
      if (product.stock > 0 && quantity > product.stock) {
        return res.status(400).json({ error: 'Not enough stock available' })
      }

      // Add new item
      const { error: insertError } = await supabase
        .from('user_cart')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
        })

      if (insertError) {
        console.error('Cart insert error:', insertError)
        return res.status(500).json({ error: 'Failed to add to cart' })
      }

      return res.status(201).json({ success: true, message: 'Added to cart' })
    } catch (error) {
      console.error('Cart add error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // DELETE - Clear entire cart
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('user_cart')
        .delete()
        .eq('user_id', userId)

      if (error) {
        return res.status(500).json({ error: 'Failed to clear cart' })
      }

      return res.status(200).json({ success: true, message: 'Cart cleared' })
    } catch (error) {
      console.error('Cart clear error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withUserAuth(handler)
