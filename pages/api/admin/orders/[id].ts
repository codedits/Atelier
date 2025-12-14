import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { sendDeliveryNotificationEmail } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query
  const orderId = String(id)
  const client = supabaseAdmin ?? supabase

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) return res.status(404).json({ error: 'Order not found' })
    return res.status(200).json(data)
  }

  // Require service role for writes
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'PUT') {
    const { status, payment_status } = req.body
    const updates: Record<string, string> = {}

    if (status) updates.status = status
    if (payment_status) updates.payment_status = payment_status

    // First get the current order to check if status is changing to 'delivered'
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single() as { data: any, error: any }

    if (fetchError || !currentOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      // @ts-ignore - Supabase client without typed schema
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    // Send delivery notification email if status changed to 'delivered'
    if (status === 'delivered' && currentOrder.status !== 'delivered') {
      const customerEmail = currentOrder.email || currentOrder.user_email
      console.log(`Order ${orderId} marked as delivered. Sending delivery notification...`)
      console.log(`Customer email: ${customerEmail || 'NOT PROVIDED'}`)
      
      if (customerEmail) {
        try {
          await sendDeliveryNotificationEmail({
            to: customerEmail,
            orderId: currentOrder.id,
            userName: currentOrder.user_name,
            items: currentOrder.items || [],
            totalPrice: currentOrder.total_price,
          })
          console.log(`✅ Delivery notification email sent to ${customerEmail} for order ${orderId}`)
        } catch (emailError) {
          console.error('❌ Failed to send delivery notification email:', emailError)
          // Don't fail the request if email fails
        }
      } else {
        console.log(`⚠️ No email address found for order ${orderId}, skipping delivery notification`)
      }
    }

    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    try {
      // First get the order to restore inventory before deleting
      const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single() as { data: any, error: any }

      if (fetchError || !order) {
        console.error('Fetch error:', fetchError)
        return res.status(404).json({ error: 'Order not found' })
      }

      // Restore inventory for all items in the order
      if (order?.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.product_id && item.quantity > 0) {
            // Get current stock and increment it
            const { data: product, error: productError } = await supabaseAdmin
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single() as { data: any, error: any }
              
            if (product && !productError) {
              await supabaseAdmin
                .from('products')
                // @ts-ignore - Supabase client without typed schema
                .update({ stock: (product.stock || 0) + item.quantity })
                .eq('id', item.product_id)
            }
          }
        }
      }

      // Delete the order
      const { error: deleteError } = await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return res.status(500).json({ error: 'Failed to delete order' })
      }

      return res.status(200).json({ 
        message: 'Order removed successfully',
        order_id: orderId
      })

    } catch (error) {
      console.error('Delete order error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
