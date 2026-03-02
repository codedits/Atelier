'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react'
import { Product, supabase } from '@/lib/supabase'

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
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'atelier_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

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

  // Validate cart against real-time database data
  const validateCart = useCallback(async () => {
    if (items.length === 0) return

    const productIds = items.map(item => item.product.id)

    // Fetch latest data for these products
    const { data: latestProducts, error } = await supabase
      .from('products')
      .select('id, price, old_price, stock, is_hidden, name, image_url, category')
      .in('id', productIds)

    if (error || !latestProducts) {
      console.error('Failed to validate cart:', error)
      return
    }

    setItems(prevItems => {
      let isChanged = false

      const validatedItems = prevItems.reduce((acc: CartItem[], item) => {
        const liveProduct = latestProducts.find(p => p.id === item.product.id)

        // Remove if product no longer exists or is hidden
        if (!liveProduct || liveProduct.is_hidden) {
          isChanged = true
          return acc
        }

        let newQuantity = item.quantity
        let productUpdated = false

        // Check stock
        if (liveProduct.stock !== null && liveProduct.stock >= 0 && item.quantity > liveProduct.stock) {
          // If stock is 0, we can still allow adding if the policy changed, but if the product explicitly tracks stock and it's less than requested:
          if (liveProduct.stock === 0) {
            // Out of stock
            isChanged = true
            return acc
          }
          newQuantity = liveProduct.stock
          isChanged = true
        }

        // Check price or other crucial fields
        if (liveProduct.price !== item.product.price || liveProduct.name !== item.product.name) {
          productUpdated = true
          isChanged = true
        }

        acc.push({
          product: productUpdated ? { ...item.product, ...liveProduct } as Product : item.product,
          quantity: newQuantity
        })

        return acc
      }, [])

      return isChanged ? validatedItems : prevItems
    })
  }, [items])

  // Validate cart once after hydration
  useEffect(() => {
    if (isHydrated) {
      validateCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]) // Only run when hydration finishes

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isHydrated])

  // Check if can add more of a product (respects stock limits)
  const canAddMore = useCallback((product: Product, additionalQty = 1): boolean => {
    // stock <= 0 means unlimited/not tracked
    if (!product.stock || product.stock <= 0) return true

    const existing = items.find((item) => item.product.id === product.id)
    const currentQty = existing?.quantity || 0
    return (currentQty + additionalQty) <= product.stock
  }, [items])

  const getItemQuantity = useCallback((productId: string): number => {
    const item = items.find((i) => i.product.id === productId)
    return item?.quantity || 0
  }, [items])

  // Returns true if added, false if blocked by stock
  const addItem = useCallback((product: Product, quantity = 1): boolean => {
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

    // Automatically open the cart drawer when an item is added
    openCart()
    return true
  }, [items, openCart])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  // Returns true if quantity set, false if blocked by stock
  const updateQuantity = useCallback((productId: string, quantity: number): boolean => {
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
  }, [items, removeItem])

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

  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    getItemQuantity,
    canAddMore,
    isCartOpen,
    openCart,
    closeCart,
  }), [
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    getItemQuantity,
    canAddMore,
    isCartOpen,
    openCart,
    closeCart,
  ])

  return (
    <CartContext.Provider value={contextValue}>
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
