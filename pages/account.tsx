import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useUserAuth } from '@/context/UserAuthContext'

interface Order {
  id: string
  created_at: string
  status: string
  payment_status: string
  total_price: number
  items: Array<{
    product_id?: string
    name: string
    quantity: number
    price: number
    image_url?: string
  }>
}

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useUserAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  // Sync profile form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      })
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleSaveProfile = async () => {
    setProfileError(null)
    setProfileSuccess(false)
    setProfileSaving(true)

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileForm),
      })

      const data = await res.json()
      
      if (!res.ok) {
        setProfileError(data.error || 'Failed to update profile')
        setProfileSaving(false)
        return
      }

      await refreshUser()
      setProfileSuccess(true)
      setIsEditing(false)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      console.error('Profile update error:', err)
      setProfileError('Network error')
    } finally {
      setProfileSaving(false)
    }
  }

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    setDeleteError(null)
    const ok = window.confirm(
      'Are you sure you want to permanently delete your account?\n\n' +
      'This will delete your personal information, but your order history will be preserved for admin records.\n\n' +
      'This action cannot be undone.'
    )
    if (!ok) return
    setDeleting(true)
    try {
      const res = await fetch('/api/auth/delete', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setDeleteError(data?.error || 'Failed to delete account')
        setDeleting(false)
        return
      }

      // ensure client-side state cleared
      await logout()
      router.push('/')
    } catch (err) {
      console.error('Delete account error', err)
      setDeleteError('Internal error')
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>My Account | Atelier</title>
        </Head>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          {/* Hero Banner Skeleton */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column Skeleton */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl p-6 h-64 animate-pulse" />
              </div>
              {/* Right Column Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl p-6 h-32 animate-pulse" />
                <div className="bg-white rounded-xl p-6 h-32 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'shipped':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  return (
    <>
      <Head>
        <title>My Account | Atelier</title>
        <meta name="description" content="Manage your Atelier account" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Hero Banner */}
        <div className="bg-white text-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl sm:text-3xl font-semibold text-white shadow-lg">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold">{user?.name || 'Welcome back!'}</h1>
                  <p className="text-gray-400 text-sm sm:text-base mt-0.5">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/products"
                  className="flex-1 sm:flex-none text-center px-5 py-2.5 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Shop Now
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none text-center px-5 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Mobile */}
        <div className="sm:hidden px-4 -mt-4">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-900/10 p-4 grid grid-cols-3 gap-4 transition-shadow duration-300">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
            <Link href="/favorites" className="text-center">
              <p className="text-2xl font-semibold text-gray-900">♥</p>
              <p className="text-xs text-gray-500">Favorites</p>
            </Link>
            <Link href="/cart" className="text-center">
              <p className="text-2xl font-semibold text-gray-900">🛒</p>
              <p className="text-xs text-gray-500">Cart</p>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {profileSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">Profile updated successfully!</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-900/10 overflow-hidden transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h2 className="font-semibold text-gray-900">Profile Details</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {isEditing ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-600 text-sm">{user?.email}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                        <textarea
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none"
                          rows={3}
                          placeholder="Enter your shipping address"
                        />
                      </div>
                      {profileError && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{profileError}</div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={profileSaving}
                          className="flex-1 px-5 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {profileSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            setProfileError(null)
                            setProfileForm({
                              name: user?.name || '',
                              phone: user?.phone || '',
                              address: user?.address || '',
                            })
                          }}
                          className="px-5 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                          <p className="text-gray-900 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                          <p className="text-gray-900">{user?.name || <span className="text-gray-400 italic">Not set</span>}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                          <p className="text-gray-900">{user?.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                          <p className="text-gray-900">{user?.address || <span className="text-gray-400 italic">Not set</span>}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links - Desktop */}
              <div className="hidden sm:block bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-900/10 overflow-hidden transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-900">Quick Links</h2>
                </div>
                <nav className="p-2">
                  <Link href="/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </span>
                    <span className="font-medium">Shop Products</span>
                  </Link>
                  <Link href="/cart" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                    <span className="font-medium">View Cart</span>
                  </Link>
                  <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </span>
                    <span className="font-medium">My Favorites</span>
                  </Link>
                </nav>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-900/10 overflow-hidden transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-900">Account Settings</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data.</p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="w-full text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting account...' : 'Delete Account'}
                  </button>
                  {deleteError && (
                    <p className="text-xs text-red-600 mt-3 text-center">{deleteError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-900/10 overflow-hidden transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Order History</h2>
                  <span className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="p-6">
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start shopping to see your orders here</p>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-100 rounded-xl p-4 sm:p-5 hover:border-gray-200 hover:shadow-sm transition-all group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className={`self-start sm:self-auto px-3 py-1.5 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="space-y-2.5 mb-4 pl-0 sm:pl-13">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 group">
                                {/* Product Image - Luxurious Frame */}
                                {item.image_url ? (
                                  <Link href={item.product_id ? `/products/${item.product_id}` : '#'} className="flex-shrink-0">
                                    <div className="relative w-16 h-16 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md group-hover:shadow-amber-200/60 group-hover:border-amber-300 transition-all duration-300">
                                      <Image
                                        src={item.image_url}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="64px"
                                      />
                                    </div>
                                  </Link>
                                ) : (
                                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300 flex items-center justify-center shadow-sm">
                                    <span className="text-xs text-gray-400 font-medium">No image</span>
                                  </div>
                                )}
                                
                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={item.product_id ? `/products/${item.product_id}` : '#'}
                                    className="text-sm font-semibold text-gray-900 hover:text-amber-700 transition-colors truncate block group-hover:text-amber-600"
                                  >
                                    {item.name}
                                  </Link>
                                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Quantity: <span className="text-gray-700 font-semibold">{item.quantity}</span></p>
                                </div>

                                {/* Price - Premium Display */}
                                <div className="flex-shrink-0 text-right">
                                  <p className="text-sm font-bold text-gray-900">₨{(item.price * item.quantity).toFixed(0)}</p>
                                  <p className="text-xs text-gray-500 mt-1">₨{item.price.toFixed(0)}/unit</p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-xs text-gray-500 px-4 py-3 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 font-medium">
                                +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                            <span className="text-lg font-semibold text-gray-900">
                              ₨{order.total_price.toFixed(2)}
                            </span>
                            <Link
                              href={`/orders/${order.id}`}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group-hover:bg-gray-900 group-hover:text-white"
                            >
                              View Details
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
