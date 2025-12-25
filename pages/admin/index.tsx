import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    const success = await login(password)
    if (success) {
      router.push('/admin/dashboard')
    } else {
      setError('Invalid password')
      setIsSubmitting(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <Head>
        <title>Admin Login | Atelier</title>
      </Head>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Atelier Admin</h1>
          <p className="text-gray-400">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-xl border border-zinc-800">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="Enter admin password"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-medium py-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <LoginForm />
    </AdminAuthProvider>
  )
}
