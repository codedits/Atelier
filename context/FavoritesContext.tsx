'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { Product } from '@/lib/supabase'
import { useUserAuth } from './UserAuthContext'

interface FavoritesContextType {
  favorites: Product[]
  favoriteIds: Set<string>
  addFavorite: (product: Product) => Promise<void>
  removeFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
  loading: boolean
  refetch: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const TOKEN_KEY = 'atelier_client_token'

function getClientToken(): string {
  if (typeof window === 'undefined') return ''
  
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    // Fallback for crypto.randomUUID() if not available (e.g. non-secure context)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      token = crypto.randomUUID()
    } else {
      token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useUserAuth()

  // Fetch favorites - uses credentials if authenticated, else client_token
  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    try {
      let res: Response
      if (isAuthenticated) {
        // Authenticated users: use cookie-based auth
        res = await fetch('/api/favorites', { credentials: 'include' })
      } else {
        // Anonymous users: use client_token
        const token = getClientToken()
        res = await fetch(`/api/favorites?client_token=${token}`)
      }
      
      if (res.ok) {
        const data: Product[] = await res.json()
        setFavorites(data)
        setFavoriteIds(new Set(data.map((p) => p.id)))
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Fetch favorites when auth state settles or changes
  useEffect(() => {
    if (!authLoading) {
      fetchFavorites()
    }
  }, [authLoading, isAuthenticated, fetchFavorites])

  const addFavorite = async (product: Product) => {
    // Optimistic update
    setFavorites((prev) => [...prev, product])
    setFavoriteIds((prev) => new Set(prev).add(product.id))

    try {
      const body: Record<string, string> = { product_id: product.id }
      if (!isAuthenticated) {
        body.client_token = getClientToken()
      }

      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        // Revert on error
        setFavorites((prev) => prev.filter((p) => p.id !== product.id))
        setFavoriteIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(product.id)
          return newSet
        })
      }
    } catch (error) {
      console.error('Failed to add favorite:', error)
      // Revert on error
      setFavorites((prev) => prev.filter((p) => p.id !== product.id))
      setFavoriteIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }
  }

  const removeFavorite = async (productId: string) => {
    const removedProduct = favorites.find((p) => p.id === productId)

    // Optimistic update
    setFavorites((prev) => prev.filter((p) => p.id !== productId))
    setFavoriteIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })

    try {
      const body: Record<string, string> = { product_id: productId }
      if (!isAuthenticated) {
        body.client_token = getClientToken()
      }

      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok && removedProduct) {
        // Revert on error
        setFavorites((prev) => [...prev, removedProduct])
        setFavoriteIds((prev) => new Set(prev).add(productId))
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      if (removedProduct) {
        setFavorites((prev) => [...prev, removedProduct])
        setFavoriteIds((prev) => new Set(prev).add(productId))
      }
    }
  }

  const isFavorite = (productId: string) => favoriteIds.has(productId)

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        addFavorite,
        removeFavorite,
        isFavorite,
        loading,
        refetch: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
