import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/components'
import { useCart } from '@/context/CartContext'
import { useUserAuth } from '@/context/UserAuthContext'
import Toast from '@/components/Toast'

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
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [orderSuccessful, setOrderSuccessful] = useState(false)
  
  // Payment proof state for COD orders
  const [paymentProof, setPaymentProof] = useState({
    transactionId: '',
    screenshot: null as File | null,
    paymentMethod: 'jazzcash' as 'jazzcash' | 'easypaisa' | 'bank'
  })
  const [uploadingProof, setUploadingProof] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  
  // Delivery fee (Rs. 500)
  const deliveryFee = 500

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
  const codFeeRequired = formData.paymentMethod === 'COD'
  const orderTotal = totalPrice + shipping + (codFeeRequired ? deliveryFee : 0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    // For COD orders, show payment form instead of submitting directly
    if (formData.paymentMethod === 'COD' && !showPaymentForm) {
      setShowPaymentForm(true)
      return
    }
    
    // Validate payment proof for COD orders
    if (formData.paymentMethod === 'COD') {
      if (!paymentProof.transactionId.trim()) {
        setError('Please enter transaction ID')
        return
      }
      if (!paymentProof.screenshot) {
        setError('Please upload payment screenshot')
        return
      }
    }
    
    setSubmitting(true)
    setLoadingProgress(10)
    let redirectTimeout: NodeJS.Timeout | null = null
    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 25
          return newProgress > 85 ? 85 : newProgress
        })
      }, 200)

      const orderItems = items.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image_url: item.product.image_url,
      }))

      // Upload payment proof for COD orders
      let paymentProofUrl = null
      if (formData.paymentMethod === 'COD' && paymentProof.screenshot) {
        setUploadingProof(true)
        const formData2 = new FormData()
        formData2.append('file', paymentProof.screenshot)
        
        const uploadRes = await fetch('/api/upload/payment-proof', {
          method: 'POST',
          credentials: 'include',
          body: formData2,
        })
        
        if (!uploadRes.ok) {
          throw new Error('Failed to upload payment proof')
        }
        
        const uploadData = await uploadRes.json()
        paymentProofUrl = uploadData.url
        setUploadingProof(false)
      }
      
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

      const orderData: any = {
        user_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city} ${formData.postalCode}`,
        items: orderItems,
        total_price: orderTotal,
        payment_method: formData.paymentMethod,
        clearCart: true,
      }
      
      // Add payment proof data for COD orders
      if (formData.paymentMethod === 'COD') {
        orderData.payment_proof = {
          transaction_id: paymentProof.transactionId,
          payment_method: paymentProof.paymentMethod,
          screenshot_url: paymentProofUrl,
          delivery_fee_paid: deliveryFee
        }
      }

      console.log('Submitting order with data:', orderData)

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      })

      console.log('Order API response status:', res.status)
      
      if (!res.ok) {
        const data = await res.json()
        console.error('Order failed:', data)
        throw new Error(data.error || 'Failed to create order')
      }

      const order = await res.json()
      console.log('Order created successfully:', order)
      console.log('Setting orderId to:', order.id)
      
      // Clear progress interval and show 100% immediately
      if (progressInterval) clearInterval(progressInterval)
      setLoadingProgress(100)
      
      // Set order ID first
      setOrderId(order.id)
      
      // Show success states IMMEDIATELY - no delay
      setToastMessage(`🎉 Order placed successfully! Order ID: #${order.id.slice(0, 8).toUpperCase()}`)
      setShowSuccessToast(true)
      setOrderCompleted(true)
      setShowThankYou(true) // Show modal immediately
      setOrderSuccessful(true) // Keep form visible
      // Keep submitting true until redirect
      
      // Redirect after 4 seconds (gives user time to see the confirmation)
      redirectTimeout = setTimeout(() => {
        console.log('Redirecting to order confirmation')
        // Clear cart before redirecting
        console.log('Clearing cart...')
        clearCart()
        console.log('Cart cleared')
        setSubmitting(false)
        setLoadingProgress(0)
        router.push(`/order-confirmation?id=${order.id}`)
      }, 4000)
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

      <div className="min-h-screen bg-white poppins-only">
        <Header />

        {/* Order Success Banner */}
        {orderCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-6 py-4"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-800 font-medium">Order placed successfully!</p>
                  <p className="text-green-600 text-sm">Order ID: #{orderId.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/order-confirmation?id=${orderId}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Details
              </button>
            </div>
          </motion.div>
        )}

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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
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
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm text-[#6B7280] mb-2">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
                          placeholder="123 Main Street, Apt 4B"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm text-[#6B7280] mb-2">City *</label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
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
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] transition-colors"
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
                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded cursor-pointer hover:border-[#D4A5A5] transition-colors">
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
                          <p className="text-sm text-[#6B7280]">Pay when you receive + advance delivery fee (₨{deliveryFee})</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded cursor-pointer hover:border-[#D4A5A5] transition-colors">
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

                  {/* COD Payment Form */}
                  {formData.paymentMethod === 'COD' && showPaymentForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[#FFF7ED] border border-[#FED7AA] rounded-lg p-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-amber-800">COD Delivery Fee Payment Required</h3>
                          <p className="text-sm text-amber-700">Please pay ₨{deliveryFee} delivery fee in advance to confirm your order</p>
                        </div>
                      </div>

                      {/* Payment Instructions */}
                      <div className="space-y-4 mb-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Choose Payment Method:</h4>
                          <div className="grid gap-2">
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:border-amber-500 transition-colors">
                              <input
                                type="radio"
                                name="paymentProofMethod"
                                value="jazzcash"
                                checked={paymentProof.paymentMethod === 'jazzcash'}
                                onChange={(e) => setPaymentProof({ ...paymentProof, paymentMethod: e.target.value as any })}
                                className="w-4 h-4 text-amber-600"
                              />
                              <div>
                                <p className="font-medium text-gray-800">JazzCash</p>
                                <p className="text-sm text-gray-600 font-mono">03XX-XXXXXXX</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:border-amber-500 transition-colors">
                              <input
                                type="radio"
                                name="paymentProofMethod"
                                value="easypaisa"
                                checked={paymentProof.paymentMethod === 'easypaisa'}
                                onChange={(e) => setPaymentProof({ ...paymentProof, paymentMethod: e.target.value as any })}
                                className="w-4 h-4 text-amber-600"
                              />
                              <div>
                                <p className="font-medium text-gray-800">EasyPaisa</p>
                                <p className="text-sm text-gray-600 font-mono">03XX-XXXXXXX</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:border-amber-500 transition-colors">
                              <input
                                type="radio"
                                name="paymentProofMethod"
                                value="bank"
                                checked={paymentProof.paymentMethod === 'bank'}
                                onChange={(e) => setPaymentProof({ ...paymentProof, paymentMethod: e.target.value as any })}
                                className="w-4 h-4 text-amber-600"
                              />
                              <div>
                                <p className="font-medium text-gray-800">Bank Transfer</p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-mono block">Account: 1234567890</span>
                                  <span className="font-mono block">IBAN: PK36ABCD0000001234567890</span>
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Payment Proof Upload */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">Transaction ID *</label>
                          <input
                            type="text"
                            required
                            value={paymentProof.transactionId}
                            onChange={(e) => setPaymentProof({ ...paymentProof, transactionId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-amber-500 transition-colors"
                            placeholder="Enter transaction ID from payment"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">Payment Screenshot *</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const MAX_BYTES = 5 * 1024 * 1024
                                  if (file.size > MAX_BYTES) {
                                    setError('File too large. Maximum size is 5MB.')
                                    return
                                  }
                                  setError('')
                                  setPaymentProof({ ...paymentProof, screenshot: file })
                                }
                              }}
                              className="hidden"
                              id="screenshot-upload"
                            />
                            <label htmlFor="screenshot-upload" className="cursor-pointer">
                              {paymentProof.screenshot ? (
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>{paymentProof.screenshot.name}</span>
                                </div>
                              ) : (
                                <div>
                                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <div className="mt-2">
                                    <span className="text-amber-600 font-medium">Click to upload</span>
                                    <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 5MB</p>
                                  </div>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setShowPaymentForm(false)}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 order-first lg:order-last">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#F8F7F5] rounded-lg p-4 sm:p-6 lg:sticky lg:top-24"
                  >
                    <h2 className="text-base sm:text-lg font-medium text-[#111827] mb-4 sm:mb-6">Order Summary</h2>

                    {/* Items */}
                    <div className="space-y-3 mb-4 sm:mb-6 max-h-48 sm:max-h-64 overflow-y-auto">
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
                      {codFeeRequired && (
                        <div className="flex justify-between text-[#6B7280]">
                          <span>COD Delivery Fee</span>
                          <span>₨{deliveryFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#111827] font-medium text-lg pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>₨{orderTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs sm:text-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-600">{error}</p>
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
                      disabled={submitting || uploadingProof}
                      className="w-full py-2.5 sm:py-3.5 px-3 sm:px-4 bg-[#1A1A1A] text-white text-sm sm:text-base font-medium rounded hover:bg-[#333] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {uploadingProof ? 'Uploading...' : 'Processing...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {formData.paymentMethod === 'COD' && !showPaymentForm ? 'Continue to Payment' : 'Place Order'}
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
          </div>
        </main>

        <Footer />
      </div>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
            
            {/* Checkmark Icon */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
              className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <motion.svg 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
                className="w-12 h-12 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4">Order Placed!</h2>
            <p className="text-gray-600 mb-3 text-lg">Thank you for your purchase! Your order has been confirmed.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-700 font-semibold">Order ID: #{orderId.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
              <p className="text-gray-700 font-medium mb-2">
                🎉 Thank you for your purchase! We really appreciate it.
              </p>
              <p className="text-sm text-gray-600">
                Check your email for order confirmation and tracking updates.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full"></div>
                <span>Redirecting to order details...</span>
              </div>
              
              <button
                onClick={() => router.push(`/order-confirmation?id=${orderId}`)}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium underline transition-colors"
              >
                View Order Details Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Toast Notification */}
      <Toast
        message={toastMessage}
        type="success"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        duration={8000}
      />
    </>
  )
}
