'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef, useMemo } from 'react'
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
const FAVS_CACHE_KEY = 'atelier_favs_cache'
const FAVS_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

function getClientToken(): string {
  if (typeof window === 'undefined') return ''

  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      token = crypto.randomUUID()
    } else {
      token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

// Session-scoped favorites cache — avoids /api/favorites on every navigation
function getCachedFavorites(): Product[] | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = sessionStorage.getItem(FAVS_CACHE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw)
    if (parsed.ts && Date.now() - parsed.ts < FAVS_CACHE_TTL) {
      return parsed.data as Product[]
    }
    sessionStorage.removeItem(FAVS_CACHE_KEY)
  } catch { /* ignore */ }
  return undefined
}

function setCachedFavorites(data: Product[]) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(FAVS_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* quota exceeded */ }
}

function clearCachedFavorites() {
  if (typeof window === 'undefined') return
  try { sessionStorage.removeItem(FAVS_CACHE_KEY) } catch { /* ignore */ }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useUserAuth()
  const fetchedRef = useRef(false)
  const prevAuthRef = useRef<boolean | null>(null)

  // Fetch favorites from API and cache
  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    try {
      let res: Response
      if (isAuthenticated) {
        res = await fetch('/api/favorites', { credentials: 'include' })
      } else {
        const token = getClientToken()
        res = await fetch(`/api/favorites?client_token=${token}`)
      }

      if (res.ok) {
        const data: Product[] = await res.json()
        setFavorites(data)
        setFavoriteIds(new Set(data.map((p) => p.id)))
        setCachedFavorites(data)
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // On mount or auth change: use cache if available, fetch only when needed
  useEffect(() => {
    if (authLoading) return

    const authChanged = prevAuthRef.current !== null && prevAuthRef.current !== isAuthenticated
    prevAuthRef.current = isAuthenticated

    if (authChanged) {
      // Auth state changed (login/logout) — clear stale cache and refetch
      clearCachedFavorites()
      fetchedRef.current = false
    }

    if (fetchedRef.current) return
    fetchedRef.current = true

    const cached = getCachedFavorites()
    if (cached !== undefined && !authChanged) {
      // Cache hit — skip API call
      setFavorites(cached)
      setFavoriteIds(new Set(cached.map((p) => p.id)))
      setLoading(false)
    } else {
      fetchFavorites()
    }
  }, [authLoading, isAuthenticated, fetchFavorites])

  const addFavorite = useCallback(async (product: Product) => {
    // Optimistic update
    setFavorites(prev => {
      const newFavs = [...prev, product]
      setCachedFavorites(newFavs)
      return newFavs
    })
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
        // Revert on error using functional update to avoid stale closures
        setFavorites(prev => {
          const reverted = prev.filter((p) => p.id !== product.id)
          setCachedFavorites(reverted)
          return reverted
        })
        setFavoriteIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(product.id)
          return newSet
        })
      }
    } catch (error) {
      console.error('Failed to add favorite:', error)
      setFavorites(prev => {
        const reverted = prev.filter((p) => p.id !== product.id)
        setCachedFavorites(reverted)
        return reverted
      })
      setFavoriteIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }
  }, [isAuthenticated])

  const removeFavorite = useCallback(async (productId: string) => {
    let removedProduct: Product | undefined

    // Optimistic update using functional state to avoid stale closures
    setFavorites(prev => {
      removedProduct = prev.find((p) => p.id === productId)
      const newFavs = prev.filter((p) => p.id !== productId)
      setCachedFavorites(newFavs)
      return newFavs
    })
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
        const product = removedProduct
        setFavorites(prev => {
          const reverted = [...prev, product]
          setCachedFavorites(reverted)
          return reverted
        })
        setFavoriteIds((prev) => new Set(prev).add(productId))
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      if (removedProduct) {
        const product = removedProduct
        setFavorites(prev => {
          const reverted = [...prev, product]
          setCachedFavorites(reverted)
          return reverted
        })
        setFavoriteIds((prev) => new Set(prev).add(productId))
      }
    }
  }, [isAuthenticated])

  // Force-refetch clears cache so next call hits API
  const forceRefetch = useCallback(async () => {
    clearCachedFavorites()
    fetchedRef.current = false
    await fetchFavorites()
  }, [fetchFavorites])

  const isFavorite = (productId: string) => favoriteIds.has(productId)

  const contextValue = useMemo(() => ({
    favorites,
    favoriteIds,
    addFavorite,
    removeFavorite,
    isFavorite,
    loading,
    refetch: forceRefetch,
  }), [
    favorites,
    favoriteIds,
    addFavorite,
    removeFavorite,
    loading,
    forceRefetch,
  ])

  return (
    <FavoritesContext.Provider value={contextValue}>
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
