import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/components'
import { useCart } from '@/context/CartContext'
import { useUserAuth } from '@/context/UserAuthContext'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart, totalItems } = useCart()
  const { user, isAuthenticated, isLoading } = useUserAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'COD' as 'COD' | 'Bank Transfer',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showThankYou, setShowThankYou] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }))
    }
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout')
    }
  }, [isLoading, isAuthenticated, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/cart')
    }
  }, [isLoading, items.length, router])

  const shipping = totalPrice >= 5000 ? 0 : 500
  const orderTotal = totalPrice + shipping

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    setLoadingProgress(10)
    let redirectTimeout: NodeJS.Timeout | null = null
    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 20
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      const orderItems = items.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image_url: item.product.image_url,
      }))

      // Save user profile data for future orders (non-blocking)
      if (isAuthenticated) {
        fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city} ${formData.postalCode}`,
          }),
        }).catch(() => {}) // Silent fail - don't block order
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city} ${formData.postalCode}`,
          items: orderItems,
          total_price: orderTotal,
          payment_method: formData.paymentMethod,
          clearCart: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('Order failed:', data)
        throw new Error(data.error || 'Failed to create order')
      }

      const order = await res.json()
      console.log('Order created successfully:', order)
      console.log('Setting orderId to:', order.id)
      console.log('Setting showThankYou to true')
      
      // Clear progress interval and show 100%
      if (progressInterval) clearInterval(progressInterval)
      setLoadingProgress(100)
      
      // Small delay to show 100% progress before showing modal
      setTimeout(() => {
        setOrderId(order.id)
        setShowThankYou(true)
        setSubmitting(false)
        setLoadingProgress(0)
      }, 500)
      
      // Redirect after 5 seconds
      redirectTimeout = setTimeout(() => {
        console.log('Redirecting to order confirmation')
        router.push(`/order-confirmation?id=${order.id}`)
      }, 5000)
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval)
      console.error('Checkout error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMsg)
      setSubmitting(false)
      setLoadingProgress(0)
    }
  }

  if (isLoading || items.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout — Atelier</title>
        </Head>
        <div className="min-h-screen bg-white">
          <Header />
          <main className="pt-24 pb-20 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-[#1A1A1A] border-t-transparent rounded-full" />
          </main>
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Checkout — Atelier</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-medium text-[#111827] mb-8"
            >
              Checkout
            </motion.h1>

            {!showThankYou && (
            <form onSubmit={handleSubmit}>
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#F8F7F5] rounded-lg p-6"
                  >
                    <h2 className="text-lg font-medium text-[#111827] mb-6">Contact Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#6B7280] mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#6B7280] mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-[#6B7280] mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Shipping Address */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#F8F7F5] rounded-lg p-6"
                  >
                    <h2 className="text-lg font-medium text-[#111827] mb-6">Shipping Address</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-[#6B7280] mb-2">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
                          placeholder="123 Main Street, Apt 4B"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#6B7280] mb-2">City *</label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#6B7280] mb-2">Postal Code *</label>
                          <input
                            type="text"
                            required
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
                            placeholder="10001"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Payment Method */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#F8F7F5] rounded-lg p-6"
                  >
                    <h2 className="text-lg font-medium text-[#111827] mb-6">Payment Method</h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded cursor-pointer hover:border-[#D4A5A5] transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="COD"
                          checked={formData.paymentMethod === 'COD'}
                          onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                          className="w-4 h-4 text-[#D4A5A5]"
                        />
                        <div>
                          <p className="font-medium text-[#111827]">Cash on Delivery</p>
                          <p className="text-sm text-[#6B7280]">Pay when you receive your order</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded cursor-pointer hover:border-[#D4A5A5] transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="Bank Transfer"
                          checked={formData.paymentMethod === 'Bank Transfer'}
                          onChange={() => setFormData({ ...formData, paymentMethod: 'Bank Transfer' })}
                          className="w-4 h-4 text-[#D4A5A5]"
                        />
                        <div>
                          <p className="font-medium text-[#111827]">Bank Transfer</p>
                          <p className="text-sm text-[#6B7280]">Transfer to our bank account</p>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#F8F7F5] rounded-lg p-6 sticky top-24"
                  >
                    <h2 className="text-lg font-medium text-[#111827] mb-6">Order Summary</h2>

                    {/* Items */}
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-white relative rounded overflow-hidden shrink-0">
                            <Image
                              src={item.product.image_url || '/placeholder.jpg'}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#111827] truncate">{item.product.name}</p>
                            <p className="text-xs text-[#6B7280]">Qty: {item.quantity}</p>
                            <p className="text-sm text-[#111827]">₨{(item.product.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-3 border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between text-[#6B7280]">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>₨{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#6B7280]">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `₨${shipping}`}</span>
                      </div>
                      <div className="flex justify-between text-[#111827] font-medium text-lg pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>₨{orderTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {submitting && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-[#6B7280]">Processing Order</span>
                          <span className="text-xs font-medium text-[#D4A5A5]">{Math.round(loadingProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#D4A5A5] to-amber-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[#1A1A1A] text-white font-medium rounded hover:bg-[#333] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Place Order
                        </span>
                      )}
                    </button>

                    <p className="text-xs text-center text-[#9CA3AF] mt-4">
                      🔒 Your information is secure and encrypted
                    </p>

                    <Link
                      href="/cart"
                      className="flex items-center justify-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] mt-4 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Cart
                    </Link>
                  </motion.div>
                </div>
              </div>
            </form>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            {/* Checkmark Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
            <p className="text-gray-600 mb-2 text-lg">Your order has been placed successfully.</p>
            <p className="text-sm text-amber-600 font-semibold mb-6">Order ID: #{orderId.slice(0, 8).toUpperCase()}</p>

            <div className="bg-amber-50 rounded-lg p-4 mb-8 border-2 border-amber-200">
              <p className="text-gray-700 font-medium">
                Thank you for your purchase! We really appreciate it.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Check your email for order confirmation and tracking updates.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full"></div>
              <span>Redirecting to order details...</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
