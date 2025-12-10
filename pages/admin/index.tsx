import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext'

function LoginForm() {
  const DEV_NO_AUTH = process.env.NEXT_PUBLIC_ADMIN_UNLOCK === 'true' || process.env.NEXT_PUBLIC_ADMIN_NO_AUTH === 'true'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [useOtp, setUseOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isLoading, admin } = useAdminAuth()
  const { generateOtp, loginWithOtp } = useAdminAuth()
  const router = useRouter()

  // Redirect if already logged in
  if (admin) {
    router.push('/admin/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // In dev no-auth mode, skip OTP/password prompts and call login with minimal data
    if (DEV_NO_AUTH) {
      const success = await login(username, '')
      if (success) {
        router.push('/admin/dashboard')
      } else {
        setError('Failed to sign in (dev)')
      }
      setLoading(false)
      return
    }

    if (useOtp) {
      // verify OTP
      const success = await loginWithOtp(username, otp)
      if (success) {
        router.push('/admin/dashboard')
      } else {
        setError('Invalid or expired OTP')
      }
      setLoading(false)
      return
    }

    const success = await login(username, password)

    if (success) {
      router.push('/admin/dashboard')
    } else {
      setError('Invalid username or password')
    }

    setLoading(false)
  }

  if (isLoading) {
    return (
      <div className="admin-layout min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#a1a1a1]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4">
            <span className="text-black text-xl font-bold">A</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Sign in to Atelier</h1>
          <p className="text-[#666] text-sm mt-2">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-[#ff616610] border border-[#ff616633] text-[#ff6166] text-[13px] px-4 py-3 rounded-lg mb-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="admin-input w-full h-10"
                placeholder="Enter username"
                required
              />
            </div>

            {!useOtp && (
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="admin-input w-full h-10"
                  placeholder="Enter password"
                  required
                />
              </div>
            )}

            {useOtp && (
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">One-time code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="admin-input w-full h-10"
                  placeholder="Enter one-time code"
                  required
                />
                {otpMessage && <p className="text-xs text-[#9aa] mt-2">{otpMessage}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn-primary w-full h-10 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          {/* OTP controls */}
          {!DEV_NO_AUTH && (
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                className="text-sm text-[#9aa] underline"
                onClick={async () => {
                  setError('')
                  setOtpMessage('')
                  if (!username) return setError('Enter username first')
                  const res = await generateOtp(username)
                  if (res.ok) {
                    // simple flow: show the code in the UI so user can use it
                    setOtpMessage(`One-time code: ${res.code}`)
                    setUseOtp(true)
                  } else {
                    setError('Failed to generate OTP')
                  }
                }}
              >
                Send one-time password
              </button>

              <button
                type="button"
                className="text-sm text-[#9aa] underline"
                onClick={() => {
                  setUseOtp(prev => !prev)
                  setError('')
                  setOtpMessage('')
                }}
              >
                {useOtp ? 'Use password' : 'Use one-time code'}
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-[#444] text-[11px] text-center mt-6">
          {DEV_NO_AUTH ? 'Dev mode: admin sign-in unlocked (no password)' : 'Default credentials: admin / admin123'}
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Sign In — Atelier Admin</title>
      </Head>
      <LoginForm />
    </AdminAuthProvider>
  )
}
