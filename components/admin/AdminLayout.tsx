import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { CommandPalette } from './CommandPalette'

interface AdminLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

// Larger SVG Icons for better touch targets
const Icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  products: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  orders: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  categories: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  homepage: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  reviews: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  layout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  menu: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  external: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  lookbook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
}

// Navigation groups for organized sidebar
const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/admin/dashboard', label: 'Overview', icon: Icons.dashboard },
      { href: '/admin/products', label: 'Products', icon: Icons.products },
      { href: '/admin/orders', label: 'Orders', icon: Icons.orders },
      { href: '/admin/reviews', label: 'Reviews', icon: Icons.reviews },
    ]
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/categories', label: 'Categories', icon: Icons.categories },
      { href: '/admin/homepage', label: 'Homepage', icon: Icons.homepage },
      { href: '/admin/lookbook', label: 'Lookbook', icon: Icons.lookbook },
      { href: '/admin/builder', label: 'Layout Builder', icon: Icons.layout },
    ]
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Icons.settings },
    ]
  },
]

export default function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const { isAuthenticated, logout, isLoading } = useAdminAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => setSidebarOpen(false)
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="admin-layout min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-black text-lg font-bold">A</span>
          </div>
          <div className="flex items-center gap-3 text-[#a1a1a1]">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Loading admin panel...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout min-h-screen flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Sidebar — wider, grouped nav, sticky */}
      <aside
        className={`admin-sidebar fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
          w-[85vw] sm:w-[280px] lg:w-[260px]
          transform transition-all duration-300 ease-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          h-screen overflow-hidden
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-5 border-b border-[#1a1a1a]">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/5">
                <span className="text-black text-sm font-bold">A</span>
              </div>
              <div>
                <span className="text-[15px] font-semibold text-white tracking-tight block leading-tight">Atelier</span>
                <span className="text-[10px] text-[#555] uppercase tracking-widest">Admin Panel</span>
              </div>
            </Link>
            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-all active:scale-95"
              aria-label="Close menu"
            >
              {Icons.close}
            </button>
          </div>

          {/* Grouped Navigation */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto admin-scrollbar">
            {navGroups.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-6' : ''}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#444]">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const isActive = router.pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150
                          ${isActive
                            ? 'bg-white/[0.08] text-white shadow-sm'
                            : 'text-[#777] hover:text-white hover:bg-white/[0.04]'
                          }
                          active:scale-[0.98]
                        `}
                      >
                        <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-[#555]'}`}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-[#1a1a1a] space-y-2">
            {/* View store shortcut */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#666] hover:text-white hover:bg-white/[0.04] transition-all active:scale-[0.98]"
            >
              {Icons.external}
              <span>View Store</span>
            </Link>

            {/* User section */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.04] transition-all active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                  <span className="text-white text-xs font-semibold">A</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">Admin</p>
                  <p className="text-[11px] text-[#555] truncate">Administrator</p>
                </div>
                <span className="text-[#555] flex-shrink-0">{Icons.chevronDown}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#111] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-20">
                    <div className="p-2">
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#999] hover:text-white hover:bg-white/[0.06] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {Icons.settings}
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); logout() }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#ff6166] hover:bg-[#ff6166]/10 transition-colors"
                      >
                        {Icons.logout}
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar — taller, spacious */}
        <header className="h-16 bg-black/80 backdrop-blur-xl border-b border-[#1a1a1a] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-all active:scale-95 flex-shrink-0"
              aria-label="Open menu"
            >
              {Icons.menu}
            </button>
            {/* Page title */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[#333] hidden sm:inline">/</span>
                <h1 className="text-white font-semibold text-[15px] truncate">{title}</h1>
              </div>
              {subtitle && (
                <p className="text-[#555] text-xs mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {actions}
            {/* Command palette shortcut */}
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111] border border-[#222] text-[#555] text-xs cursor-pointer hover:border-[#333] transition-colors"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                document.dispatchEvent(event)
              }}
            >
              {Icons.search}
              <span className="ml-1">Search</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-[#1a1a1a] border border-[#2a2a2a] font-mono">{typeof navigator !== 'undefined' && /Mac|iPhone/.test(navigator.platform) ? '⌘K' : 'Ctrl+K'}</kbd>
            </div>
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-[13px] text-[#666] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-[#111]"
            >
              <span>Store</span>
              {Icons.external}
            </Link>
          </div>
        </header>

        {/* Page content — generous padding, max-width for readability */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-black">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
