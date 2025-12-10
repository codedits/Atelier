import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

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

  if (req.method === 'GET') {
    // Get dashboard stats
    const [productsRes, ordersRes, lowStockRes] = await Promise.all([
      supabase.from('products').select('id, stock', { count: 'exact' }),
      supabase.from('orders').select('id, status, payment_status, total_price, created_at'),
      supabase.from('products').select('id, name, stock').lte('stock', 5).gt('stock', 0)
    ])

    const products = productsRes.data || []
    const orders = ordersRes.data || []
    const lowStock = lowStockRes.data || []

    // Calculate stats
    const totalProducts = products.length
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const shippedOrders = orders.filter(o => o.status === 'shipped').length
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length
    
    // Today's stats
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = orders.filter(o => o.created_at?.startsWith(today))
    const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    const todayOrderCount = todayOrders.length

    // Revenue
    const totalRevenue = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + Number(o.total_price || 0), 0)

    // Out of stock
    const outOfStock = products.filter(p => p.stock === 0).length

    return res.status(200).json({
      totalProducts,
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      todaySales,
      todayOrderCount,
      totalRevenue,
      lowStockCount: lowStock.length,
      lowStockProducts: lowStock,
      outOfStock
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
