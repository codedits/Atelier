import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  shippedOrders: number
  deliveredOrders: number
  todaySales: number
  todayOrderCount: number
  totalRevenue: number
  lowStockCount: number
  lowStockProducts: { id: string; name: string; stock: number }[]
  outOfStock: number
}

// Icons
const Icons = {
  products: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  orders: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  pending: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  revenue: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  arrowRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function DashboardContent() {
  const api = useAdminApi()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<DashboardStats>('/dashboard')
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#666]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-[#ff6166]">Failed to load dashboard data</p>
      </div>
    )
  }

  const statCards = [
    { 
      label: 'Total Products', 
      value: stats.totalProducts, 
      icon: Icons.products, 
      color: 'text-[#a78bfa]',
      bgColor: 'bg-[#a78bfa]/10'
    },
    { 
      label: 'Total Orders', 
      value: stats.totalOrders, 
      icon: Icons.orders, 
      color: 'text-[#60a5fa]',
      bgColor: 'bg-[#60a5fa]/10'
    },
    { 
      label: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: Icons.pending, 
      color: 'text-[#f5a623]',
      bgColor: 'bg-[#f5a623]/10'
    },
    { 
      label: 'Total Revenue', 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      icon: Icons.revenue, 
      color: 'text-[#50e3c2]',
      bgColor: 'bg-[#50e3c2]/10'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div 
            key={card.label} 
            className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-5 hover:border-[#333] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <span className={card.color}>{card.icon}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
              <p className="text-[#666] text-sm">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activity */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#262626]">
            <h3 className="text-[15px] font-medium text-white">Today's Activity</h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-[#888] text-sm">Orders Today</span>
                <span className="text-white font-medium">{stats.todayOrderCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-[#262626]">
                <span className="text-[#888] text-sm">Sales Today</span>
                <span className="text-[#50e3c2] font-medium">${stats.todaySales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-[#262626]">
                <span className="text-[#888] text-sm">Shipped Orders</span>
                <span className="text-[#60a5fa] font-medium">{stats.shippedOrders}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-[#262626]">
                <span className="text-[#888] text-sm">Delivered Orders</span>
                <span className="text-[#50e3c2] font-medium">{stats.deliveredOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between">
            <h3 className="text-[15px] font-medium text-white">Stock Alerts</h3>
            {stats.outOfStock > 0 && (
              <span className="admin-badge admin-badge-error">
                {stats.outOfStock} out of stock
              </span>
            )}
          </div>
          <div className="p-5">
            {stats.lowStockProducts.length === 0 ? (
              <div className="flex items-center gap-2 text-[#50e3c2] text-sm py-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>All products are well-stocked</span>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex justify-between items-center py-2">
                    <span className="text-[#888] text-sm truncate max-w-[200px]">{product.name}</span>
                    <span className={`text-sm font-medium ${
                      product.stock <= 2 ? 'text-[#ff6166]' : 'text-[#f5a623]'
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                ))}
                {stats.lowStockProducts.length > 5 && (
                  <Link 
                    href="/admin/products" 
                    className="flex items-center gap-1 text-[#888] hover:text-white text-sm mt-2 transition-colors"
                  >
                    <span>View all ({stats.lowStockProducts.length})</span>
                    {Icons.arrowRight}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#262626]">
          <h3 className="text-[15px] font-medium text-white">Quick Actions</h3>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products?action=add"
              className="admin-btn admin-btn-primary"
            >
              {Icons.plus}
              <span>Add Product</span>
            </Link>
            <Link
              href="/admin/orders?status=pending"
              className="admin-btn admin-btn-secondary"
            >
              View Pending Orders
            </Link>
            <Link
              href="/admin/categories"
              className="admin-btn admin-btn-secondary"
            >
              Manage Categories
            </Link>
            <Link
              href="/admin/homepage"
              className="admin-btn admin-btn-secondary"
            >
              Edit Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Overview — Atelier Admin</title>
      </Head>
      <AdminLayout title="Overview">
        <DashboardContent />
      </AdminLayout>
    </AdminAuthProvider>
  )
}
