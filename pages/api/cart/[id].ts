import type { NextApiResponse } from 'next'
import { withUserAuth, AuthenticatedRequest } from '@/lib/user-auth-middleware'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Cart item ID is required' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const userId = req.user.id

  // PUT - Update cart item quantity
  if (req.method === 'PUT') {
    const { quantity } = req.body

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative number' })
    }

    try {
      // Verify ownership
      const { data: cartItem, error: fetchError } = await supabase
        .from('user_cart')
        .select('id, product_id')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (fetchError || !cartItem) {
        return res.status(404).json({ error: 'Cart item not found' })
      }

      // If quantity is 0, delete the item
      if (quantity === 0) {
        await supabase.from('user_cart').delete().eq('id', id)
        return res.status(200).json({ success: true, message: 'Item removed from cart' })
      }

      // Check stock
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', cartItem.product_id)
        .single()

      if (product && product.stock > 0 && quantity > product.stock) {
        return res.status(400).json({ error: 'Not enough stock available' })
      }

      const { error: updateError } = await supabase
        .from('user_cart')
        .update({ quantity })
        .eq('id', id)

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update cart' })
      }

      return res.status(200).json({ success: true, message: 'Cart updated' })
    } catch (error) {
      console.error('Cart update error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // DELETE - Remove item from cart
  if (req.method === 'DELETE') {
    try {
      // Verify ownership and delete
      const { error } = await supabase
        .from('user_cart')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        return res.status(500).json({ error: 'Failed to remove item' })
      }

      return res.status(200).json({ success: true, message: 'Item removed from cart' })
    } catch (error) {
      console.error('Cart delete error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withUserAuth(handler)
