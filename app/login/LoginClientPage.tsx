'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginForm from '@/components/LoginForm'
import { useUserAuth } from '@/context/UserAuthContext'

interface LoginClientPageProps {
  redirect?: string
}

export default function LoginClientPage({ redirect }: LoginClientPageProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useUserAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectUrl = typeof redirect === 'string' ? redirect : '/account'
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, redirect, router])

  const handleLoginSuccess = () => {
    const redirectUrl = typeof redirect === 'string' ? redirect : '/account'
    router.push(redirectUrl)
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </>
    )
  }

  if (isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Redirecting...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-light tracking-widest text-gray-900">ATELIER</h1>
            </Link>
            <p className="mt-3 text-gray-600">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-700">
              By signing in, you agree to our{' '}
              <Link href="/terms-of-service" className="text-gray-700 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-gray-700 hover:underline">
                Privacy Policy
              </Link>
            </p>

            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/products"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
