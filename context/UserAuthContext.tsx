'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

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

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

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
    }
  }

  const refreshUser = async (): Promise<void> => {
    await checkSession()
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
