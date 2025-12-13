import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useUserAuth } from '@/context/UserAuthContext'

interface OrderItem {
  product_id?: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface Order {
  id: string
  created_at: string
  status: string
  payment_status: string
  payment_method: string
  total_price: number
  user_name: string
  phone: string
  address: string
  email?: string
  items: OrderItem[]
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated, isLoading: authLoading } = useUserAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/orders/${id}`))
    }
  }, [authLoading, isAuthenticated, router, id])

  useEffect(() => {
    if (isAuthenticated && id && typeof id === 'string') {
      fetchOrder(id)
    }
  }, [isAuthenticated, id])

  const fetchOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      })
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('Order not found')
        } else if (res.status === 403) {
          setError('You do not have permission to view this order')
        } else {
          setError('Failed to load order')
        }
        setLoading(false)
        return
      }
      
      const data = await res.json()
      setOrder(data)
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'shipped':
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  const canCancelOrder = () => {
    if (!order) {
      console.log('canCancelOrder: No order data')
      return false
    }
    
    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      console.log('canCancelOrder: Order status is', order.status, '(not pending)')
      return false
    }
    
    try {
      const orderDate = new Date(order.created_at)
      const currentDate = new Date()
      
      // If date parsing failed, don't allow cancellation
      if (isNaN(orderDate.getTime())) {
        console.error('Invalid order date:', order.created_at)
        return false
      }
      
      // Calculate difference in milliseconds
      const timeDifference = currentDate.getTime() - orderDate.getTime()
      
      // Convert to days (using exact calculation: 24 * 60 * 60 * 1000 ms per day)
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24)
      
      console.log('canCancelOrder: Order date:', order.created_at, 'Days difference:', daysDifference.toFixed(2))
      
      // Allow if within 2 days (< 2 days, not <=)
      const canCancel = daysDifference < 2
      console.log('canCancelOrder: Result =', canCancel)
      return canCancel
    } catch (e) {
      console.error('Error checking cancel eligibility:', e)
      return false
    }
  }

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    setCancelLoading(true)
    setCancelError(null)
    setCancelSuccess(false)

    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId: order.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCancelError(data.error || 'Failed to cancel order')
        return
      }

      setCancelSuccess(true)
      // Redirect back to account after 1 second
      setTimeout(() => {
        router.push('/account')
      }, 1000)
    } catch (err) {
      console.error('Failed to cancel order:', err)
      setCancelError('Network error')
    } finally {
      setCancelLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Order Details | Atelier</title>
        </Head>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Order Not Found | Atelier</title>
        </Head>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-light text-gray-900 mb-4">{error}</h1>
            <Link
              href="/account"
              className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Account
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!order) return null

  return (
    <>
      <Head>
        <title>Order #{order.id.slice(0, 8).toUpperCase()} | Atelier</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Account
          </Link>

          {/* Order Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-medium text-gray-900">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on{' '}
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-3 items-end">
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                    Payment: {order.payment_status}
                  </span>
                </div>
                {order.status === 'pending' && (
                  <>
                    {canCancelOrder() ? (
                      <button
                        onClick={handleCancelOrder}
                        disabled={cancelLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    ) : (
                      <p className="text-xs text-gray-500">Cannot cancel (older than 2 days)</p>
                    )}
                  </>
                )}
                {cancelError && (
                  <p className="text-sm text-red-600">{cancelError}</p>
                )}
                {cancelSuccess && (
                  <p className="text-sm text-green-600">Order cancelled successfully</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Items ({order.items.length})
              </h2>
              <div className="space-y-2.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 group">
                    {/* Product Image - Luxurious Frame */}
                    {item.image_url ? (
                      <Link href={item.product_id ? `/products/${item.product_id}` : '#'} className="flex-shrink-0">
                        <div className="relative w-16 h-16 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md group-hover:shadow-amber-200/60 group-hover:border-amber-300 transition-all duration-300">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="64px"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300 flex items-center justify-center shadow-sm">
                        <span className="text-xs text-gray-400 font-medium">No image</span>
                      </div>
                    )}
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.product_id ? `/products/${item.product_id}` : '#'}
                        className="text-sm font-semibold text-gray-900 hover:text-amber-700 transition-colors block truncate group-hover:text-amber-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">Quantity: <span className="text-gray-700 font-semibold">{item.quantity}</span></p>
                    </div>

                    {/* Price - Premium Display */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">₨{(item.price * item.quantity).toFixed(0)}</p>
                      <p className="text-xs text-gray-500 mt-1">₨{item.price.toFixed(0)}/unit</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>₨{order.total_price.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Shipping Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                  Shipping Information
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900 font-medium">{order.user_name}</p>
                  <p className="text-gray-600">{order.phone}</p>
                  {order.email && <p className="text-gray-600">{order.email}</p>}
                  <p className="text-gray-600">{order.address}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                  Payment Method
                </h2>
                <p className="text-gray-900">{order.payment_method}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
