'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface AdminUser {
  id: string
  username: string
}

interface AdminAuthContextType {
  admin: AdminUser | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  generateOtp: (username: string) => Promise<{ ok: boolean; code?: string }>
  loginWithOtp: (username: string, otp: string) => Promise<boolean>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const TOKEN_KEY = 'atelier_admin_token'
const ADMIN_KEY = 'atelier_admin_user'

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    // DEV UNLOCK: allow bypassing admin login when NEXT_PUBLIC_ADMIN_UNLOCK=true
    // This is intended for local testing ONLY. Do NOT enable in production.
    if (process.env.NEXT_PUBLIC_ADMIN_UNLOCK === 'true') {
      const devAdmin = { id: 'local-admin', username: 'admin' }
      setAdmin(devAdmin)
      setToken('dev-unlocked')
      setIsLoading(false)
      return
    }

    const storedToken = Cookies.get(TOKEN_KEY)
    const storedAdmin = localStorage.getItem(ADMIN_KEY)

    if (storedToken && storedAdmin) {
      // Verify token is still valid
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
        .then(res => {
          if (res.ok) {
            setToken(storedToken)
            setAdmin(JSON.parse(storedAdmin))
          } else {
            // Token invalid, clear storage
            Cookies.remove(TOKEN_KEY)
            localStorage.removeItem(ADMIN_KEY)
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) return false

      const data = await res.json()
      
      // Store token in cookie (8 hours expiry)
      Cookies.set(TOKEN_KEY, data.token, { expires: 1/3 })
      localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin))
      
      setToken(data.token)
      setAdmin(data.admin)
      
      return true
    } catch {
      return false
    }
  }

  const generateOtp = async (username: string): Promise<{ ok: boolean; code?: string }> => {
    try {
      const res = await fetch('/api/admin/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      if (!res.ok) return { ok: false }
      const data = await res.json()
      // returns { ok: true, code }
      return { ok: true, code: data.code }
    } catch {
      return { ok: false }
    }
  }

  const loginWithOtp = async (username: string, otp: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp })
      })

      if (!res.ok) return false

      const data = await res.json()
      Cookies.set(TOKEN_KEY, data.token, { expires: 1/3 })
      localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin))
      setToken(data.token)
      setAdmin(data.admin)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    Cookies.remove(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
    setToken(null)
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, login, generateOtp, loginWithOtp, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
