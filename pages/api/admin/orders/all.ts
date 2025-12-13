import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

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

  // Require service role for writes
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'DELETE') {
    try {
      console.log('Starting delete all orders operation')
      
      // Get all orders
      const { data: orders, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('*') as { data: any[], error: any }

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        return res.status(500).json({ error: 'Failed to fetch orders', details: fetchError })
      }

      console.log(`Found ${orders?.length || 0} orders to delete`)

      if (!orders || orders.length === 0) {
        return res.status(200).json({ 
          message: 'No orders to delete',
          deleted_count: 0
        })
      }

      // Restore inventory for all items in all orders
      for (const order of orders) {
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
      }

      // Delete all orders - iterate through each order to delete
      let deletedCount = 0
      const deleteErrors = []

      for (const order of orders) {
        const { error: deleteError } = await supabaseAdmin
          .from('orders')
          .delete()
          .eq('id', order.id)

        if (deleteError) {
          console.error(`Delete error for order ${order.id}:`, deleteError)
          deleteErrors.push({ order_id: order.id, error: deleteError.message })
        } else {
          deletedCount++
        }
      }

      if (deleteErrors.length > 0 && deletedCount === 0) {
        return res.status(500).json({ error: 'Failed to delete orders', details: deleteErrors })
      }

      console.log(`Successfully deleted ${deletedCount} orders`)
      return res.status(200).json({ 
        message: 'All orders deleted successfully',
        deleted_count: deletedCount,
        failed_count: deleteErrors.length
      })

    } catch (error) {
      console.error('Delete all orders error:', error)
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
