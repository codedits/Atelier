import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const client = supabaseAdmin ?? supabase

  // Use count queries instead of fetching all rows
  const today = new Date().toISOString().split('T')[0]

  const [
    productsCountRes,
    ordersRes,
    lowStockRes,
    outOfStockRes,
    todayOrdersRes
  ] = await Promise.all([
    client.from('products').select('id', { count: 'exact', head: true }),
    client.from('orders').select('id, status, payment_status, total_price, created_at'),
    client.from('products').select('id, name, stock').lte('stock', 5).gt('stock', 0),
    client.from('products').select('id', { count: 'exact', head: true }).eq('stock', 0),
    client.from('orders').select('id, total_price').gte('created_at', `${today}T00:00:00.000Z`)
  ])

  const orders = ordersRes.data || []
  const lowStock = lowStockRes.data || []
  const todayOrders = todayOrdersRes.data || []

  const totalProducts = productsCountRes.count || 0
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const shippedOrders = orders.filter(o => o.status === 'shipped').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length

  const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
  const todayOrderCount = todayOrders.length

  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0)

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
    outOfStock: outOfStockRes.count || 0
  })
}
