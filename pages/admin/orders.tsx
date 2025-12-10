import { useEffect, useState } from 'react'
import Head from 'next/head'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import { Order, OrderItem } from '@/lib/supabase'

// Icons
const Icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  eye: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function OrdersContent() {
  const api = useAdminApi()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await api.get<Order[]>('/orders')
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}`, { status })
      loadOrders()
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status: status as Order['status'] })
      }
    } catch {
      alert('Failed to update order')
    }
  }

  const updatePaymentStatus = async (id: string, payment_status: string) => {
    try {
      await api.put(`/orders/${id}`, { payment_status })
      loadOrders()
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, payment_status: payment_status as Order['payment_status'] })
      }
    } catch {
      alert('Failed to update payment')
    }
  }

  const filteredOrders = orders.filter(o => {
    if (search) {
      const searchLower = search.toLowerCase()
      if (!o.user_name.toLowerCase().includes(searchLower) &&
          !o.phone.includes(search) &&
          !o.id.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    if (filterStatus && o.status !== filterStatus) return false
    if (filterPayment && o.payment_status !== filterPayment) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'admin-badge admin-badge-warning'
      case 'shipped': return 'admin-badge bg-[#60a5fa]/10 text-[#60a5fa]'
      case 'delivered': return 'admin-badge admin-badge-success'
      default: return 'admin-badge admin-badge-neutral'
    }
  }

  const getPaymentBadge = (status: string) => {
    return status === 'paid'
      ? 'admin-badge admin-badge-success'
      : 'admin-badge admin-badge-error'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#666]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm">Loading orders...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">{Icons.search}</span>
          <input
            type="text"
            placeholder="Search by name, phone, or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input w-full pl-9"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="admin-input pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
              {Icons.chevronDown}
            </span>
          </div>
          <div className="relative">
            <select
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              className="admin-input pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Payments</option>
              <option value="pending">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
              {Icons.chevronDown}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-[#666]">
          Total: <span className="text-white">{orders.length}</span>
        </span>
        <span className="text-[#f5a623]">
          Pending: {orders.filter(o => o.status === 'pending').length}
        </span>
        <span className="text-[#60a5fa]">
          Shipped: {orders.filter(o => o.status === 'shipped').length}
        </span>
        <span className="text-[#50e3c2]">
          Delivered: {orders.filter(o => o.status === 'delivered').length}
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <span className="text-[#666] font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td>
                    <div>
                      <p className="text-white text-sm">{order.user_name}</p>
                      <p className="text-[#666] text-xs">{order.phone}</p>
                    </div>
                  </td>
                  <td>
                    <span className="text-white text-sm font-medium">${order.total_price}</span>
                    <span className="text-[#666] text-xs ml-1">({order.payment_method})</span>
                  </td>
                  <td>
                    <div className="relative inline-block">
                      <select
                        value={order.payment_status}
                        onChange={e => updatePaymentStatus(order.id, e.target.value)}
                        className={`${getPaymentBadge(order.payment_status)} cursor-pointer appearance-none pr-6 border-0`}
                      >
                        <option value="pending">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        className={`${getStatusBadge(order.status)} cursor-pointer appearance-none pr-6 border-0 capitalize`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[#666] text-xs">{formatDate(order.created_at)}</span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1 text-[#888] hover:text-white text-sm transition-colors"
                    >
                      {Icons.eye}
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-[#666]">
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#262626] flex justify-between items-start">
              <div>
                <h2 className="text-white text-[15px] font-medium">Order Details</h2>
                <p className="text-[#666] text-xs font-mono mt-1">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#666] hover:text-white transition-colors"
              >
                {Icons.close}
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Customer Info */}
              <div>
                <h3 className="text-[#888] text-xs font-medium uppercase tracking-wide mb-3">Customer</h3>
                <div className="bg-[#111] border border-[#262626] rounded-lg p-4">
                  <p className="text-white text-sm">{selectedOrder.user_name}</p>
                  <p className="text-[#888] text-sm mt-1">{selectedOrder.phone}</p>
                  <p className="text-[#666] text-sm mt-2">{selectedOrder.address}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-[#888] text-xs font-medium uppercase tracking-wide mb-3">Items</h3>
                <div className="bg-[#111] border border-[#262626] rounded-lg divide-y divide-[#262626]">
                  {(selectedOrder.items as OrderItem[]).map((item, i) => (
                    <div key={i} className="flex justify-between p-4">
                      <div>
                        <p className="text-white text-sm">{item.name}</p>
                        <p className="text-[#666] text-xs mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white text-sm">${item.price * item.quantity}</p>
                    </div>
                  ))}
                  <div className="p-4 flex justify-between bg-[#0a0a0a]">
                    <span className="text-[#888] text-sm">Total</span>
                    <span className="text-white font-semibold">${selectedOrder.total_price}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[#888] text-xs font-medium uppercase tracking-wide mb-3">Payment</h3>
                  <div className="bg-[#111] border border-[#262626] rounded-lg p-4">
                    <p className="text-white text-sm mb-2">{selectedOrder.payment_method}</p>
                    <div className="relative inline-block">
                      <select
                        value={selectedOrder.payment_status}
                        onChange={e => updatePaymentStatus(selectedOrder.id, e.target.value)}
                        className={`${getPaymentBadge(selectedOrder.payment_status)} cursor-pointer appearance-none pr-6 border-0`}
                      >
                        <option value="pending">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[#888] text-xs font-medium uppercase tracking-wide mb-3">Status</h3>
                  <div className="bg-[#111] border border-[#262626] rounded-lg p-4">
                    <div className="relative inline-block">
                      <select
                        value={selectedOrder.status}
                        onChange={e => updateOrderStatus(selectedOrder.id, e.target.value)}
                        className={`${getStatusBadge(selectedOrder.status)} cursor-pointer appearance-none pr-6 border-0 capitalize`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div>
                <h3 className="text-[#888] text-xs font-medium uppercase tracking-wide mb-3">Order Date</h3>
                <p className="text-white text-sm">{formatDate(selectedOrder.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminOrders() {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Orders — Atelier Admin</title>
      </Head>
      <AdminLayout title="Orders">
        <OrdersContent />
      </AdminLayout>
    </AdminAuthProvider>
  )
}
