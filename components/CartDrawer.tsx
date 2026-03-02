'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useUserAuth } from '@/context/UserAuthContext'
import { cn } from '@/lib/utils'

export default function CartDrawer() {
    const { isCartOpen, closeCart, items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()
    const { isAuthenticated } = useUserAuth()

    // Prevent background scrolling when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isCartOpen])

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300",
                    isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
                )}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[110] transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] shadow-2xl flex flex-col",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] shrink-0">
                    <h2 className="text-xl font-medium text-[#1A1A1A] font-serif">Shopping Bag ({totalItems})</h2>
                    <button
                        onClick={closeCart}
                        className="p-2 -mr-2 text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors"
                        aria-label="Close cart"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cart Items Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-[#888]">
                            <svg className="w-12 h-12 mb-4 text-[#E5E5E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="text-sm uppercase tracking-[0.1em] mb-2">Your Bag is empty</p>
                            <Link
                                href="/products"
                                onClick={closeCart}
                                className="text-xs text-[#1A1A1A] underline underline-offset-4 hover:text-[#888] transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product.id} className="flex gap-4">
                                {/* Image */}
                                <Link href={`/products/${item.product.id}`} onClick={closeCart} className="shrink-0">
                                    <div className="w-20 h-24 bg-[#F8F7F5] relative overflow-hidden">
                                        <Image
                                            src={item.product.image_url || '/placeholder.jpg'}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </Link>

                                {/* Details */}
                                <div className="flex flex-col flex-1 justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <Link href={`/products/${item.product.id}`} onClick={closeCart}>
                                                <h3 className="text-sm font-medium text-[#1A1A1A] hover:text-[#888] transition-colors leading-snug">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="text-[#888] hover:text-red-500 transition-colors ml-2"
                                                aria-label="Remove item"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-xs text-[#888] mt-1 capitalize">{item.product.category}</p>
                                        <p className="text-sm font-medium text-[#1A1A1A] mt-2">
                                            ₨{item.product.price.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center border border-[#E5E5E5]">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center text-[#888] hover:text-[#1A1A1A] transition-colors"
                                            >
                                                <span className="text-xs">−</span>
                                            </button>
                                            <span className="w-6 text-center text-xs font-medium text-[#1A1A1A]">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                disabled={item.product.stock > 0 && item.quantity >= item.product.stock}
                                                className="w-7 h-7 flex items-center justify-center text-[#888] hover:text-[#1A1A1A] transition-colors disabled:opacity-30"
                                            >
                                                <span className="text-xs">+</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Area */}
                {items.length > 0 && (
                    <div className="border-t border-[#E5E5E5] p-6 bg-[#FAF9F6] shrink-0">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm text-[#4A4A4A] uppercase tracking-[0.1em]">Subtotal</span>
                            <span className="text-base font-medium text-[#1A1A1A]">₨{totalPrice.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-[#888] mb-6 text-center">
                            Shipping and taxes calculated at checkout.
                        </p>
                        <Link
                            href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
                            onClick={closeCart}
                            className="block w-full py-4 px-6 bg-[#1A1A1A] hover:bg-[#333] text-white text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-center transition-colors"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}
