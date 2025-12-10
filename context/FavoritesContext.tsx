'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Product } from '@/lib/supabase'

interface FavoritesContextType {
  favorites: Product[]
  favoriteIds: Set<string>
  addFavorite: (product: Product) => Promise<void>
  removeFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const TOKEN_KEY = 'atelier_client_token'

function getClientToken(): string {
  if (typeof window === 'undefined') return ''
  
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = getClientToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/favorites?client_token=${token}`)
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
    }

    fetchFavorites()
  }, [])

  const addFavorite = async (product: Product) => {
    const token = getClientToken()
    
    // Optimistic update
    setFavorites((prev) => [...prev, product])
    setFavoriteIds((prev) => new Set(prev).add(product.id))

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, client_token: token }),
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
    const token = getClientToken()
    const removedProduct = favorites.find((p) => p.id === productId)

    // Optimistic update
    setFavorites((prev) => prev.filter((p) => p.id !== productId))
    setFavoriteIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })

    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, client_token: token }),
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
