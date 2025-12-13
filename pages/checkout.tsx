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

  const shipping = totalPrice >= 100 ? 0 : 10
  const orderTotal = totalPrice + shipping

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image_url: item.product.image_url,
      }))

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
        throw new Error(data.error || 'Failed to create order')
      }

      const order = await res.json()
      clearCart()
      router.push(`/order-confirmation?id=${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
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
                            <p className="text-sm text-[#111827]">${(item.product.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-3 border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between text-[#6B7280]">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>${totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#6B7280]">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                      </div>
                      <div className="flex justify-between text-[#111827] font-medium text-lg pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>${orderTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-[#1A1A1A] text-white font-medium rounded hover:bg-[#333] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
                        'Place Order'
                      )}
                    </button>

                    <Link
                      href="/cart"
                      className="block text-center text-sm text-[#6B7280] hover:text-[#111827] mt-4 transition-colors"
                    >
                      ← Back to Cart
                    </Link>
                  </motion.div>
                </div>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
