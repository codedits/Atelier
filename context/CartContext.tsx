'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react'
import { Product } from '@/lib/supabase'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => boolean
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => boolean
  clearCart: () => void
  totalItems: number
  totalPrice: number
  getItemQuantity: (productId: string) => number
  canAddMore: (product: Product, additionalQty?: number) => boolean
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'atelier_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isHydrated])

  // Check if can add more of a product (respects stock limits)
  const canAddMore = (product: Product, additionalQty = 1): boolean => {
    // stock <= 0 means unlimited/not tracked
    if (!product.stock || product.stock <= 0) return true
    
    const existing = items.find((item) => item.product.id === product.id)
    const currentQty = existing?.quantity || 0
    return (currentQty + additionalQty) <= product.stock
  }

  const getItemQuantity = (productId: string): number => {
    const item = items.find((i) => i.product.id === productId)
    return item?.quantity || 0
  }

  // Returns true if added, false if blocked by stock
  const addItem = (product: Product, quantity = 1): boolean => {
    // Check stock limit
    if (product.stock && product.stock > 0) {
      const existing = items.find((item) => item.product.id === product.id)
      const currentQty = existing?.quantity || 0
      if (currentQty + quantity > product.stock) {
        return false // Can't add more than stock
      }
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, quantity }]
    })
    return true
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  // Returns true if quantity set, false if blocked by stock
  const updateQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeItem(productId)
      return true
    }

    const item = items.find((i) => i.product.id === productId)
    if (!item) return false

    // Check stock limit
    if (item.product.stock && item.product.stock > 0 && quantity > item.product.stock) {
      return false
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
    return true
  }

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // Memoize computed values to prevent recalculation on every render
  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  )
  
  const totalPrice = useMemo(() => 
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        getItemQuantity,
        canAddMore,
        isLoading: !isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
