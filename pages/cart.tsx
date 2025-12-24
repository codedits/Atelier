import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/components'
import { useCart } from '@/context/CartContext'
import { useUserAuth } from '@/context/UserAuthContext'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const { isAuthenticated } = useUserAuth()

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Shopping Cart — Atelier</title>
        </Head>
        <div className="min-h-screen bg-white">
          <Header />
          <main className="pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-medium text-[#111827] mb-4">Your cart is empty</h1>
                <p className="text-[#6B7280] mb-8">Looks like you haven&apos;t added any items yet.</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#1A1A1A] text-white font-medium rounded hover:bg-[#333] transition-colors"
                >
                  Continue Shopping
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Shopping Cart ({totalItems}) — Atelier</title>
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
              Shopping Cart
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-100"
                  >
                    {/* Product Image */}
                    <Link href={`/products/${item.product.id}`} className="shrink-0 w-full sm:w-auto">
                      <div className="w-full sm:w-24 h-32 sm:h-24 md:w-32 md:h-32 bg-[#F8F7F5] relative overflow-hidden rounded">
                        <Image
                          src={item.product.image_url || '/placeholder.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-medium text-[#111827] hover:text-[#B91C1C] transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-[#6B7280] mt-1 capitalize">{item.product.category}</p>
                      <p className="text-[#111827] font-medium mt-2">₨{item.product.price.toLocaleString()}</p>
                      
                      {/* Stock warning */}
                      {item.product.stock > 0 && item.quantity >= item.product.stock && (
                        <p className="text-xs text-amber-600 mt-1">
                          Only {item.product.stock} available
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-gray-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-3 py-1 text-[#6B7280] hover:text-[#111827] transition-colors"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-[#111827] min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              const canUpdate = updateQuantity(item.product.id, item.quantity + 1)
                              if (!canUpdate) {
                                // Show feedback that max stock reached
                              }
                            }}
                            disabled={item.product.stock > 0 && item.quantity >= item.product.stock}
                            className="px-3 py-1 text-[#6B7280] hover:text-[#111827] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-sm text-[#6B7280] hover:text-red-500 transition-colors flex items-center gap-1 group"
                        >
                          <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right w-full sm:w-auto">                      <p className="text-xs text-[#6B7280] mb-2 sm:hidden">Line Total</p>
                      <p className="font-medium text-[#111827]">
                        ₨{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={clearCart}
                  className="text-sm text-[#6B7280] hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 order-first lg:order-last">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#F8F7F5] rounded-lg p-6 sticky top-24"
                >
                  <h2 className="text-lg font-medium text-[#111827] mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₨{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Shipping</span>
                      <span>{totalPrice >= 5000 ? 'Free' : '₨500'}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between text-[#111827] font-medium">
                      <span>Total</span>
                      <span>₨{(totalPrice + (totalPrice >= 5000 ? 0 : 500)).toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
                    className="block w-full py-3 bg-[#1A1A1A] text-white text-center font-medium rounded hover:bg-[#333] transition-colors"
                  >
                    {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                  </Link>

                  <Link
                    href="/products"
                    className="block text-center text-sm text-[#6B7280] hover:text-[#111827] mt-4 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
