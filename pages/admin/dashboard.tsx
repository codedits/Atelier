import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider } from '@/context/ToastContext'
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
      bgColor: 'bg-[#a78bfa]/10',
      borderColor: 'border-[#a78bfa]/20',
      link: '/admin/products'
    },
    { 
      label: 'Total Orders', 
      value: stats.totalOrders, 
      icon: Icons.orders, 
      color: 'text-[#60a5fa]',
      bgColor: 'bg-[#60a5fa]/10',
      borderColor: 'border-[#60a5fa]/20',
      link: '/admin/orders'
    },
    { 
      label: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: Icons.pending, 
      color: 'text-[#f5a623]',
      bgColor: 'bg-[#f5a623]/10',
      borderColor: 'border-[#f5a623]/20',
      link: '/admin/orders?status=pending'
    },
    { 
      label: 'Total Revenue', 
      value: `₨${stats.totalRevenue.toLocaleString()}`, 
      icon: Icons.revenue, 
      color: 'text-[#50e3c2]',
      bgColor: 'bg-[#50e3c2]/10',
      borderColor: 'border-[#50e3c2]/20',
      link: '/admin/orders'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-[#666] text-sm">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products?action=add" className="admin-btn admin-btn-primary text-sm">
            {Icons.plus}
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid — larger cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map(card => (
          <Link
            key={card.label}
            href={card.link}
            className={`bg-[#0a0a0a] border ${card.borderColor} rounded-2xl p-5 sm:p-6 hover:bg-[#111] transition-all duration-200 group active:scale-[0.98]`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                <span className={card.color}>{card.icon}</span>
              </div>
              <span className="text-[#333] group-hover:text-[#555] transition-colors">
                {Icons.arrowRight}
              </span>
            </div>
            <div className="space-y-1.5">
              <p className={`text-2xl sm:text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-[#666] text-sm">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Today's Activity */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-white">Today&apos;s Activity</h3>
            <span className="admin-badge admin-badge-neutral text-[11px]">Live</span>
          </div>
          <div className="p-6">
            <div className="space-y-0">
              {[
                { label: 'Orders Today', value: stats.todayOrderCount, color: 'text-white' },
                { label: 'Sales Today', value: `₨${stats.todaySales.toLocaleString()}`, color: 'text-[#50e3c2]' },
                { label: 'Shipped Orders', value: stats.shippedOrders, color: 'text-[#60a5fa]' },
                { label: 'Delivered Orders', value: stats.deliveredOrders, color: 'text-[#50e3c2]' },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between items-center py-3.5 ${i > 0 ? 'border-t border-[#1a1a1a]' : ''}`}>
                  <span className="text-[#888] text-sm">{row.label}</span>
                  <span className={`${row.color} font-semibold text-lg`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-white">Stock Alerts</h3>
            {stats.outOfStock > 0 && (
              <span className="admin-badge admin-badge-error text-[11px]">
                {stats.outOfStock} out of stock
              </span>
            )}
          </div>
          <div className="p-6">
            {stats.lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 text-[#50e3c2] py-8">
                <div className="w-12 h-12 rounded-full bg-[#50e3c2]/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">All products are well-stocked</span>
              </div>
            ) : (
              <div className="space-y-0">
                {stats.lowStockProducts.slice(0, 5).map((product, i) => (
                  <div key={product.id} className={`flex justify-between items-center py-3.5 ${i > 0 ? 'border-t border-[#1a1a1a]' : ''}`}>
                    <span className="text-[#888] text-sm truncate mr-4">{product.name}</span>
                    <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${
                      product.stock === 0 ? 'bg-[#ff4444]/10 text-[#ff6166]' :
                      product.stock <= 2 ? 'bg-[#ff6166]/10 text-[#ff6166]' : 'bg-[#f5a623]/10 text-[#f5a623]'
                    }`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                    </span>
                  </div>
                ))}
                {stats.lowStockProducts.length > 5 && (
                  <Link 
                    href="/admin/products" 
                    className="flex items-center gap-2 text-[#888] hover:text-white text-sm mt-4 py-2 transition-colors"
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

      {/* Quick Actions — card grid */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1a1a1a]">
          <h3 className="text-[15px] font-semibold text-white">Quick Actions</h3>
          <p className="text-[#555] text-xs mt-1">Jump to common tasks</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { href: '/admin/products?action=add', label: 'Add Product', icon: Icons.plus, desc: 'Create new listing' },
              { href: '/admin/orders?status=pending', label: 'Pending Orders', icon: Icons.pending, desc: `${stats.pendingOrders} awaiting` },
              { href: '/admin/categories', label: 'Categories', icon: Icons.products, desc: 'Manage tags' },
              { href: '/admin/homepage', label: 'Edit Homepage', icon: Icons.revenue, desc: 'Update content' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col gap-3 p-4 sm:p-5 rounded-xl border border-[#1a1a1a] hover:border-[#333] hover:bg-[#111] transition-all active:scale-[0.97] group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] group-hover:bg-[#222] flex items-center justify-center text-[#888] group-hover:text-white transition-colors">
                  {action.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{action.label}</p>
                  <p className="text-[#555] text-xs mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Head>
          <title>Overview — Atelier Admin</title>
        </Head>
        <AdminLayout title="Overview">
          <DashboardContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
