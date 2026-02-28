'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'

interface User {
  id: string
  email: string
  name?: string
  phone?: string
  address?: string
}

interface UserAuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  generateOtp: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

// Session-scoped auth cache — avoids /api/auth/me on every navigation
const AUTH_CACHE_KEY = 'atelier_auth_cache'

function getCachedAuth(): User | null | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = sessionStorage.getItem(AUTH_CACHE_KEY)
    if (!raw) return undefined // no cache yet
    const parsed = JSON.parse(raw)
    // Cache valid for 10 minutes within the session
    if (parsed.ts && Date.now() - parsed.ts < 10 * 60 * 1000) {
      return parsed.user as User | null
    }
    sessionStorage.removeItem(AUTH_CACHE_KEY)
  } catch { /* ignore */ }
  return undefined
}

function setCachedAuth(user: User | null) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ user, ts: Date.now() }))
  } catch { /* quota exceeded — ignore */ }
}

function clearCachedAuth() {
  if (typeof window === 'undefined') return
  try { sessionStorage.removeItem(AUTH_CACHE_KEY) } catch { /* ignore */ }
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const checkedRef = useRef(false)

  // Fetch auth from API and cache the result
  const fetchAndCacheAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setCachedAuth(data.user)
      } else {
        setUser(null)
        setCachedAuth(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // On mount: use sessionStorage cache if available, otherwise fetch once
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true

    const cached = getCachedAuth()
    if (cached !== undefined) {
      // Cache hit — skip API call entirely
      setUser(cached)
      setIsLoading(false)
    } else {
      // Cache miss — fetch from API (once per session)
      fetchAndCacheAuth()
    }
  }, [fetchAndCacheAuth])

  const generateOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send OTP' }
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid OTP' }
      }

      setUser(data.user)
      setCachedAuth(data.user)
      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
      clearCachedAuth()
    }
  }

  const refreshUser = async (): Promise<void> => {
    clearCachedAuth()
    await fetchAndCacheAuth()
  }

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        generateOtp,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider')
  }
  return context
}
