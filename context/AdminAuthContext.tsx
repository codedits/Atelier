'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'

interface AdminAuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  token: string | null
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const TOKEN_KEY = 'atelier_admin_token'

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = Cookies.get(TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password })
      })

      if (res.ok) {
        const data = await res.json()
        Cookies.set(TOKEN_KEY, data.token, { expires: 1 })
        setToken(data.token)
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  const logout = () => {
    Cookies.remove(TOKEN_KEY)
    setToken(null)
    setIsAuthenticated(false)
    router.push('/admin')
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, token }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
