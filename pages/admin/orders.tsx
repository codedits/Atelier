import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
import { Order, OrderItem, PaymentProof } from '@/lib/supabase'

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
  const toast = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('')
  const [isDeleteAllLoading, setIsDeleteAllLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const pendingStatusRef = useRef<Map<string, { status?: string; payment_status?: string }>>(new Map())

  // Perform actual status update
  const performStatusUpdate = async (id: string, updates: { status?: string; payment_status?: string }) => {
    try {
      await api.put(`/orders/${id}`, updates)
      setOrders(prev => prev.map(o => {
        if (o.id === id) {
          const updatedOrder = { ...o }
          if (updates.status) updatedOrder.status = updates.status as Order['status']
          if (updates.payment_status) updatedOrder.payment_status = updates.payment_status as Order['payment_status']
          return updatedOrder
        }
        return o
      }))
      if (selectedOrder?.id === id) {
        const updated = { ...selectedOrder }
        if (updates.status) updated.status = updates.status as Order['status']
        if (updates.payment_status) updated.payment_status = updates.payment_status as Order['payment_status']
        setSelectedOrder(updated)
      }
      
      // Show success message
      if (updates.status === 'delivered') {
        toast.success('Order marked as delivered and customer notified!')
      } else if (updates.status) {
        toast.success(`Order status updated to ${updates.status}`)
      } else if (updates.payment_status) {
        toast.success(`Payment status updated to ${updates.payment_status}`)
      }
      
      pendingStatusRef.current.delete(id)
    } catch (error) {
      console.error('Failed to update order:', error)
      toast.error('Failed to update order')
    }
  }

  const { debounced: debouncedStatusUpdate } = useDebounce(
    performStatusUpdate,
    350 // 350ms debounce for dropdown updates
  )

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

  const updateOrderStatus = (id: string, status: string) => {
    // Store pending update
    const pending = pendingStatusRef.current.get(id) || {}
    pendingStatusRef.current.set(id, { ...pending, status })
    
    // Update UI immediately
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as Order['status'] } : o))
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status: status as Order['status'] })
    }
    
    // Debounce the API call
    debouncedStatusUpdate(id, { ...pendingStatusRef.current.get(id) })
  }

  const updatePaymentStatus = (id: string, payment_status: string) => {
    // Store pending update
    const pending = pendingStatusRef.current.get(id) || {}
    pendingStatusRef.current.set(id, { ...pending, payment_status })
    
    // Update UI immediately
    setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: payment_status as Order['payment_status'] } : o))
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, payment_status: payment_status as Order['payment_status'] })
    }
    
    // Debounce the API call
    debouncedStatusUpdate(id, { ...pendingStatusRef.current.get(id) })
  }

  const handleDeleteAllOrders = async () => {
    if (!deleteAllConfirmText || deleteAllConfirmText !== String(orders.length)) {
      toast.error(`Please type the number of orders (${orders.length}) to confirm deletion`)
      return
    }

    setIsDeleteAllLoading(true)
    try {
      await api.del('/orders/all')
      
      // Clear all orders from state
      setOrders([])
      setSelectedOrder(null)
      setShowDeleteAllModal(false)
      setDeleteAllConfirmText('')
      toast.success('All orders have been successfully deleted!')
    } catch (error) {
      console.error('Error deleting all orders:', error)
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to delete all orders'}`)
    } finally {
      setIsDeleteAllLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await api.del(`/orders/${orderToDelete.id}`)
      
      // Remove order from state
      setOrders(prev => prev.filter(order => order.id !== orderToDelete.id))
      if (selectedOrder?.id === orderToDelete.id) {
        setSelectedOrder(null)
      }
      
      setShowDeleteModal(false)
      setOrderToDelete(null)
      toast.success('Order deleted successfully')
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast.error('Failed to remove order: ' + (error as Error).message)
    } finally {
      setIsDeleting(false)
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
    switch (status) {
      case 'paid': return 'admin-badge admin-badge-success'
      case 'verified': return 'admin-badge admin-badge-success'
      case 'proof_submitted': return 'admin-badge bg-[#fbbf24]/10 text-[#fbbf24]'
      case 'proof_pending': return 'admin-badge admin-badge-warning'
      case 'rejected': return 'admin-badge admin-badge-error'
      case 'pending': return 'admin-badge admin-badge-neutral'
      default: return 'admin-badge admin-badge-neutral'
    }
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
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]">{Icons.search}</span>
          <input
            type="text"
            placeholder="Search by name, phone, or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input w-full pl-11 py-3"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[140px]">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="admin-input pr-8 py-3 appearance-none cursor-pointer w-full"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
              {Icons.chevronDown}
            </span>
          </div>
          <div className="relative min-w-[140px]">
            <select
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              className="admin-input pr-8 py-3 appearance-none cursor-pointer w-full"
            >
              <option value="">All Payments</option>
              <option value="pending">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
              {Icons.chevronDown}
            </span>
          </div>
          {orders.length > 0 && (
            <button
              onClick={() => {
                setShowDeleteAllModal(true)
                setDeleteAllConfirmText('')
              }}
              className="px-5 py-3 bg-red-600/15 hover:bg-red-600/25 text-red-400 rounded-xl border border-red-600/25 text-sm font-medium transition-colors"
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{orders.length}</p>
          <p className="text-[#666] text-xs mt-1">Total Orders</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-[#f5a623]">{orders.filter(o => o.status === 'pending').length}</p>
          <p className="text-[#666] text-xs mt-1">Pending</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-[#60a5fa]">{orders.filter(o => o.status === 'shipped').length}</p>
          <p className="text-[#666] text-xs mt-1">Shipped</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-[#50e3c2]">{orders.filter(o => o.status === 'delivered').length}</p>
          <p className="text-[#666] text-xs mt-1">Delivered</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th className="hidden sm:table-cell">Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-[#111]">
                  <td>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{order.user_name}</p>
                      <p className="text-[#555] text-xs truncate">{order.phone}</p>
                      <p className="text-[#444] font-mono text-[10px] mt-0.5 sm:hidden">₨{order.total_price}</p>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="text-white text-sm font-medium">₨{order.total_price}</span>
                    <span className="text-[#555] text-xs ml-1">({order.payment_method})</span>
                  </td>
                  <td>
                    <div className="relative inline-block">
                      <select
                        value={order.payment_status}
                        onChange={e => updatePaymentStatus(order.id, e.target.value)}
                        className={`${getPaymentBadge(order.payment_status)} cursor-pointer appearance-none pr-6 border-0 text-xs`}
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
                        className={`${getStatusBadge(order.status)} cursor-pointer appearance-none pr-6 border-0 capitalize text-xs`}
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
                  <td className="hidden md:table-cell">
                    <span className="text-[#555] text-xs">{formatDate(order.created_at)}</span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-2 text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg text-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        {Icons.eye}
                        <span className="hidden sm:inline">View</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setOrderToDelete(order)
                          setShowDeleteModal(true)
                        }}
                        className="px-3 py-2 text-[#666] hover:text-[#ff6166] hover:bg-[#ff6166]/10 rounded-lg text-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        <span className="hidden sm:inline">Remove</span>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <p className="text-white text-sm font-medium mb-1">No orders found</p>
            <p className="text-[#555] text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-[#1a1a1a] flex justify-between items-start">
              <div>
                <h2 className="text-white text-base font-semibold">Order Details</h2>
                <p className="text-[#555] text-xs font-mono mt-1">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 flex items-center justify-center text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                {Icons.close}
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)] admin-scrollbar">
              {/* Customer Info */}
              <div>
                <h3 className="text-[#888] text-xs font-medium uppercase tracking-wider mb-3">Customer</h3>
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                  <p className="text-white text-sm font-medium">{selectedOrder.user_name}</p>
                  <p className="text-[#888] text-sm mt-1.5">{selectedOrder.phone}</p>
                  <p className="text-[#666] text-sm mt-2.5 leading-relaxed">{selectedOrder.address}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-[#888] text-xs font-medium uppercase tracking-wider mb-3">Items</h3>
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl divide-y divide-[#1a1a1a] overflow-hidden">
                  {(selectedOrder.items as OrderItem[]).map((item, i) => (
                    <div key={i} className="flex justify-between p-4 sm:p-5">
                      <div>
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-[#555] text-xs mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white text-sm font-medium">₨{item.price * item.quantity}</p>
                    </div>
                  ))}
                  <div className="p-4 sm:p-5 flex justify-between bg-[#0d0d0d]">
                    <span className="text-[#888] text-sm font-medium">Total</span>
                    <span className="text-white font-bold text-base">₨{selectedOrder.total_price}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[#888] text-xs font-medium uppercase tracking-wider mb-3">Payment</h3>
                  <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                    <p className="text-white text-sm mb-3">{selectedOrder.payment_method}</p>
                    <div className="relative inline-block">
                      <select
                        value={selectedOrder.payment_status}
                        onChange={e => updatePaymentStatus(selectedOrder.id, e.target.value)}
                        className={`${getPaymentBadge(selectedOrder.payment_status)} cursor-pointer appearance-none pr-6 border-0`}
                      >
                        <option value="pending">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="proof_pending">Proof Pending</option>
                        <option value="proof_submitted">Proof Submitted</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
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
                  <h3 className="text-[#888] text-xs font-medium uppercase tracking-wider mb-3">Status</h3>
                  <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
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

              {/* Payment Proof (for COD orders) */}
              {selectedOrder.payment_method === 'COD' && selectedOrder.payment_proof && (
                <div>
                  <h3 className="text-[#888] text-xs font-medium uppercase tracking-wider mb-3">Payment Proof</h3>
                  <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#666] text-xs">Method</span>
                        <p className="text-white capitalize mt-0.5">{selectedOrder.payment_proof.payment_method}</p>
                      </div>
                      <div>
                        <span className="text-[#666] text-xs">Transaction ID</span>
                        <p className="text-white font-mono text-xs mt-0.5">{selectedOrder.payment_proof.transaction_id}</p>
                      </div>
                      <div>
                        <span className="text-[#666] text-xs">Amount</span>
                        <p className="text-white mt-0.5">₨{selectedOrder.payment_proof.delivery_fee_paid}</p>
                      </div>
                      <div>
                        <span className="text-[#666] text-xs">Uploaded</span>
                        <p className="text-white text-xs mt-0.5">{new Date(selectedOrder.payment_proof.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {selectedOrder.payment_proof.screenshot_url && (
                      <div>
                        <span className="text-[#666] text-xs mb-2 block">Payment Screenshot</span>
                        <div className="relative rounded-xl overflow-hidden border border-[#1a1a1a]">
                          <img
                            src={selectedOrder.payment_proof?.screenshot_url}
                            alt="Payment proof"
                            className="max-w-full max-h-48 rounded-xl cursor-pointer"
                            onClick={() => window.open(selectedOrder.payment_proof?.screenshot_url, '_blank')}
                          />
                          <button
                            onClick={() => window.open(selectedOrder.payment_proof?.screenshot_url, '_blank')}
                            className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-black/80 transition-colors"
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <h3 className="text-[#888] text-xs font-medium uppercase tracking-wider mb-3">Order Date</h3>
                <p className="text-white text-sm">{formatDate(selectedOrder.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#ff4444]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-[#ff6166]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 className="text-white text-base font-semibold mb-2 text-center">Remove Order</h3>
            <p className="text-[#777] text-sm mb-6 text-center">
              Permanently remove order <span className="text-white font-mono">#{orderToDelete.id.slice(0, 8)}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setOrderToDelete(null)
                }}
                disabled={isDeleting}
                className="flex-1 admin-btn admin-btn-secondary py-2.5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={isDeleting}
                className="flex-1 admin-btn admin-btn-danger py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting && (
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                )}
                {isDeleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Orders Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#ff4444]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-[#ff6166]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 className="text-white text-base font-semibold mb-2 text-center">Delete All Orders</h3>
            <p className="text-[#777] text-sm mb-1 text-center">
              This will permanently delete <span className="text-white font-bold">{orders.length} order{orders.length !== 1 ? 's' : ''}</span> and restore inventory.
            </p>
            <p className="text-red-400 text-sm mb-5 text-center">
              This action cannot be undone.
            </p>
            <div className="mb-5">
              <label className="text-[#888] text-xs font-medium mb-2 block">
                Type the number of orders ({orders.length}) to confirm:
              </label>
              <input
                type="text"
                placeholder={String(orders.length)}
                value={deleteAllConfirmText}
                onChange={e => setDeleteAllConfirmText(e.target.value)}
                className="admin-input w-full py-3 px-4 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteAllModal(false)
                  setDeleteAllConfirmText('')
                }}
                className="flex-1 admin-btn admin-btn-secondary py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllOrders}
                disabled={isDeleteAllLoading || deleteAllConfirmText !== String(orders.length)}
                className="flex-1 admin-btn admin-btn-danger py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleteAllLoading ? 'Deleting...' : 'Delete All'}
              </button>
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
      <ToastProvider>
        <Head>
          <title>Orders — Atelier Admin</title>
        </Head>
        <AdminLayout title="Orders" subtitle="Track and manage customer orders">
          <OrdersContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
