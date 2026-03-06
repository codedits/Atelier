import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseClient } from '@/lib/admin-api-utils'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromNextRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = getSupabaseClient()
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

  return NextResponse.json({
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
  }, { status: 200 })
}