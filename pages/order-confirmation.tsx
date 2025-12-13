import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/components'

interface Order {
  id: string
  user_name: string
  phone: string
  address: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total_price: number
  payment_method: string
  payment_status: string
  status: string
  created_at: string
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetch(`/api/orders/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setOrder(data)
          }
        })
        .catch(err => console.error('Failed to fetch order:', err))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <>
        <Head>
          <title>Order Confirmation — Atelier</title>
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
        <title>Order Confirmed — Atelier</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-24 pb-20">
          <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Success Icon with animation */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              >
                <motion.svg 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="w-12 h-12 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </motion.svg>
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-medium text-[#111827] mb-4">
                Thank You for Your Order!
              </h1>
              <p className="text-[#6B7280] mb-2">
                We&apos;ve received your order and will begin processing it soon.
              </p>
              <p className="text-sm text-[#9CA3AF] mb-8">
                A confirmation email has been sent to your email address.
              </p>

              {order && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#F8F7F5] rounded-lg p-6 text-left mb-8"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-sm text-[#6B7280]">Order Number</p>
                      <p className="font-mono text-[#111827] font-medium">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#6B7280]">Date</p>
                      <p className="text-[#111827]">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm text-[#6B7280] mb-2">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-[#111827]">{item.name} × {item.quantity}</span>
                          <span className="text-[#111827]">₨{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between font-medium">
                      <span className="text-[#111827]">Total</span>
                      <span className="text-[#111827]">₨{order.total_price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Shipping To</p>
                      <p className="text-[#111827]">{order.user_name}</p>
                      <p className="text-[#6B7280] text-sm">{order.address}</p>
                      <p className="text-[#6B7280] text-sm">{order.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Payment Method</p>
                      <p className="text-[#111827]">{order.payment_method}</p>
                      <p className="text-sm text-[#6B7280] capitalize">Status: {order.payment_status}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {order?.payment_method === 'Bank Transfer' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left"
                >
                  <p className="font-medium text-yellow-800 mb-2">Bank Transfer Instructions</p>
                  <p className="text-sm text-yellow-700">
                    Please transfer the total amount to our bank account. Your order will be processed once payment is confirmed.
                  </p>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/account"
                  className="px-8 py-3 bg-[#1A1A1A] text-white font-medium rounded hover:bg-[#333] transition-colors"
                >
                  View My Orders
                </Link>
                <Link
                  href="/products"
                  className="px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] font-medium rounded hover:bg-[#1A1A1A] hover:text-white transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
