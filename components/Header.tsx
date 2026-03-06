"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useCart } from '@/context/CartContext'
import { useUserAuth } from '@/context/UserAuthContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useSiteConfig } from '@/context/SiteConfigContext'

const Header = memo(function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const currentPath = pathname || '/'
  const [open, setOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasScrolled, setHasScrolled] = useState(false)
  const { totalItems, openCart } = useCart()
  const { isAuthenticated, user } = useUserAuth()
  const { favorites } = useFavorites()
  const { config } = useSiteConfig()

  // Memoized scroll handler
  const handleScroll = useCallback(() => {
    setHasScrolled(window.scrollY > 200)
  }, [])

  // Detect scroll to change header style on homepage
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Check if current page matches the link - memoized
  const isActive = useCallback((path: string) => {
    const currentGender = typeof window !== 'undefined'
      ? new URL(window.location.href).searchParams.get('gender')
      : null

    if (path === '/products' && currentPath === '/products' && !currentGender) return true
    if (path.includes('?gender=')) {
      const gender = path.split('gender=')[1]
      return currentPath === '/products' && currentGender === gender
    }
    return currentPath === path
  }, [currentPath])

  // Determine if we're on homepage and should show transparent header - memoized
  const isHomepage = currentPath === '/'
  const shouldBeTransparent = useMemo(() => isHomepage && !hasScrolled, [isHomepage, hasScrolled])

  // Memoized toggle handler
  const toggleMenu = useCallback(() => setOpen(prev => !prev), [])
  const closeMenu = useCallback(() => setOpen(false), [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const target = `/products?search=${encodeURIComponent(searchQuery.trim())}`
      router.push(target)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  // Close search overlay and mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false)
        if (open) setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, open])

  // Lock body scroll when search overlay is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isSearchOpen])

  return (
    <>
      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-fadeIn">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col">
            <div className="flex items-center justify-between h-20 border-b border-[#E5E5E5]">
              <span className="font-display text-xl font-semibold tracking-[0.05em] text-[#1A1A1A]">SEARCH</span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-[#1A1A1A] hover:text-[#888] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search for jewelry, collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-3xl md:text-5xl font-display border-b-2 border-[#1A1A1A] py-4 focus:outline-none placeholder:text-[#E5E5E5] text-[#1A1A1A]"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 bottom-6 text-[#1A1A1A] hover:text-[#888] transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
              <div className="mt-12 w-full">
                <p className="text-xs uppercase tracking-[0.2em] text-[#888] mb-6">Quick Links</p>
                <div className="flex flex-wrap gap-4">
                  {['New Arrivals', 'Best Sellers', 'Rings', 'Necklaces', 'Earrings'].map((link) => (
                    <button
                      key={link}
                      onClick={() => {
                        setSearchQuery(link)
                        const target = `/products?search=${encodeURIComponent(link)}`
                        router.push(target)
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="px-6 py-2 border border-[#E5E5E5] text-sm hover:border-[#1A1A1A] transition-colors"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotional Banner - Only visible on non-homepage */}
      {currentPath !== '/' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A] text-white text-center py-2 px-4 shadow-sm h-8 flex items-center justify-center">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium text-[#FAF9F6]"><span className="text-[#C9A96E] mr-2">✦</span> Complimentary shipping on orders over ₨5,000 <span className="text-[#C9A96E] ml-2">✦</span></p>
        </div>
      )}

      <header className={`fixed ${currentPath === '/' ? 'top-0' : 'top-8 md:top-8'} left-0 right-0 z-40 transition-all duration-500 ease-out ${shouldBeTransparent
        ? 'bg-transparent border-b-0 py-2'
        : 'bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-sm py-0'
        }`}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Left: Navigation & Hamburger */}
            <div className="flex-1 flex items-center justify-start gap-4">
              <button
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={toggleMenu}
                className={`lg:hidden p-2 -ml-2 focus:outline-none transition-colors ${shouldBeTransparent ? 'text-white hover:text-white/80' : 'text-[#1A1A1A] hover:text-[#888]'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <nav className="hidden lg:flex items-center gap-8">
                {config?.nav_menu && config.nav_menu.length > 0 ? (
                  config.nav_menu.map(item => (
                    <Link key={item.id} href={item.href} className={`text-[11px] uppercase tracking-[0.15em] transition-colors relative group ${isActive(item.href) ? 'text-[#1A1A1A] font-medium' : shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A]/80 hover:text-[#1A1A1A]'}`}>
                      {item.label}
                      <span className={`absolute -bottom-1.5 left-0 right-0 h-px bg-current transition-transform duration-300 origin-left ${isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                    </Link>
                  ))
                ) : (
                  <Link href="/products" className={`text-[11px] uppercase tracking-[0.15em] transition-colors relative group ${isActive('/products') ? 'text-[#1A1A1A] font-medium' : shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A]/80 hover:text-[#1A1A1A]'}`}>
                    Shop All
                    <span className={`absolute -bottom-1.5 left-0 right-0 h-px bg-current transition-transform duration-300 origin-left ${isActive('/products') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </Link>
                )}
              </nav>
            </div>

            {/* Center: Logo */}
            <div className="flex-[1.5] max-w-fit flex justify-center items-center">
              <Link href="/" className={`font-display text-2xl md:text-3xl lg:text-[2rem] font-medium tracking-[0.15em] transition-colors ${shouldBeTransparent
                ? 'text-white hover:text-white/90'
                : 'text-[#1A1A1A] hover:text-[#4A4A4A]'
                }`}>
                ATELIER
              </Link>
            </div>

            {/* Right: Icons */}
            <div className="flex-1 flex items-center justify-end gap-5 lg:gap-7">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className={`transition-colors flex items-center gap-2 group ${shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#4A4A4A]'}`}
              >
                <span className="hidden xl:inline-block text-[10px] font-medium uppercase tracking-[0.15em] opacity-80 group-hover:opacity-100 transition-opacity">Search</span>
                <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <Link href={isAuthenticated ? '/account' : '/login'} aria-label="Account" className={`hidden md:flex flex-col items-center gap-1 transition-colors relative group ${shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#4A4A4A]'}`}>
                <div className="flex items-center gap-2">
                  <span className="hidden xl:inline-block text-[10px] font-medium uppercase tracking-[0.15em] opacity-80 group-hover:opacity-100 transition-opacity">Sign In</span>
                  <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {isAuthenticated && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.1em] uppercase text-[#4A4A4A] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                )}
              </Link>

              <Link href="/favorites" aria-label="Favorites" className={`hidden md:flex items-center gap-2 transition-colors relative group ${shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#4A4A4A]'}`}>
                <span className="hidden xl:inline-block text-[10px] font-medium uppercase tracking-[0.15em] opacity-80 group-hover:opacity-100 transition-opacity">Wishlist</span>
                <div className="relative">
                  <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {favorites.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#1A1A1A] text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                      {favorites.length > 9 ? '9+' : favorites.length}
                    </span>
                  )}
                </div>
              </Link>

              <button onClick={openCart} aria-label="Cart" className={`transition-colors relative flex items-center gap-2 group ${shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#4A4A4A]'}`}>
                <span className="hidden xl:inline-block text-[10px] font-medium uppercase tracking-[0.15em] opacity-80 group-hover:opacity-100 transition-opacity">Bag</span>
                <div className="relative">
                  <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] bg-[#1A1A1A] text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden bg-white border-t border-[#E5E5E5] ${open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-6">
            <div className="flex flex-col gap-4">
              {config?.nav_menu && config.nav_menu.length > 0 ? (
                config.nav_menu.map(item => (
                  <Link key={item.id} onClick={closeMenu} href={item.href} className="text-base text-[#1A1A1A] hover:text-[#888] font-semibold">{item.label}</Link>
                ))
              ) : (
                <Link onClick={closeMenu} href="/products" className="text-base text-[#1A1A1A] hover:text-[#888] font-semibold">Shop All</Link>
              )}
              <Link onClick={closeMenu} href="/favorites" className="text-base text-[#1A1A1A] hover:text-[#888] font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites
              </Link>
              <div className="border-t border-[#E5E5E5] pt-4 mt-2">
                {isAuthenticated ? (
                  <Link onClick={closeMenu} href="/account" className="text-base text-[#1A1A1A] hover:text-[#888] font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Account
                  </Link>
                ) : (
                  <Link onClick={closeMenu} href="/login" className="text-base text-[#1A1A1A] hover:text-[#888] font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
})

export default Header
