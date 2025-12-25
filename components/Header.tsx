import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useCart } from '@/context/CartContext'
import { useUserAuth } from '@/context/UserAuthContext'
import { useFavorites } from '@/context/FavoritesContext'

const Header = memo(function Header() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasScrolled, setHasScrolled] = useState(false)
  const { totalItems } = useCart()
  const { isAuthenticated, user } = useUserAuth()
  const { favorites } = useFavorites()

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
    if (path === '/products' && router.pathname === '/products' && !router.query.gender) return true
    if (path.includes('?gender=')) {
      const gender = path.split('gender=')[1]
      return router.pathname === '/products' && router.query.gender === gender
    }
    return router.pathname === path
  }, [router.pathname, router.query.gender])

  // Determine if we're on homepage and should show transparent header - memoized
  const isHomepage = router.pathname === '/'
  const shouldBeTransparent = useMemo(() => isHomepage && !hasScrolled, [isHomepage, hasScrolled])

  // Memoized toggle handler
  const toggleMenu = useCallback(() => setOpen(prev => !prev), [])
  const closeMenu = useCallback(() => setOpen(false), [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

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
                className="p-2 text-[#1A1A1A] hover:text-[#7A4A2B] transition-colors"
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
                    className="absolute right-0 bottom-6 text-[#1A1A1A] hover:text-[#7A4A2B] transition-colors"
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
                        router.push(`/products?search=${encodeURIComponent(link)}`)
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
      {router.pathname !== '/' && (
        <div className="bg-[#1A1A1A] text-white text-center py-2.5 px-4">
          <p className="text-xs font-medium tracking-wide">✨ Free shipping on orders over ₨5,000 | Free returns</p>
        </div>
      )}
      
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        shouldBeTransparent
          ? 'bg-transparent border-b-0' 
          : 'bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className={`font-display text-xl font-semibold tracking-[0.05em] transition-colors ${
              // Hide on mobile homepage while hero is visible to avoid collision with large editorial text
              isHomepage && !hasScrolled ? 'hidden sm:inline-block' : 'inline-block'
            } ${
              shouldBeTransparent
                ? 'text-white hover:text-white/80' 
                : 'text-[#1A1A1A] hover:text-[#7A4A2B]'
            }`}>
              ATELIER
            </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className={`text-sm transition-colors font-semibold relative ${isActive('/products') ? 'text-[#7A4A2B]' : shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#7A4A2B]'}`}>
              Shop All
              {isActive('/products') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7A4A2B] rounded-full" />}
            </Link>
            <Link href="/products?gender=women" className={`text-sm transition-colors font-semibold relative ${isActive('/products?gender=women') ? 'text-[#7A4A2B]' : shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#7A4A2B]'}`}>
              Women
              {isActive('/products?gender=women') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7A4A2B] rounded-full" />}
            </Link>
            <Link href="/products?gender=men" className={`text-sm transition-colors font-semibold relative ${isActive('/products?gender=men') ? 'text-[#7A4A2B]' : shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#7A4A2B]'}`}>
              Men
              {isActive('/products?gender=men') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7A4A2B] rounded-full" />}
            </Link>
            <Link href="/#collections" className={`text-sm transition-colors font-semibold ${shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#7A4A2B]'}`}>Collections</Link>
          </nav>            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search" 
                className={`transition-all ${shouldBeTransparent ? 'text-white/90 hover:text-white hover:scale-110' : 'text-[#1A1A1A] hover:text-[#7A4A2B] hover:scale-110'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link href="/favorites" aria-label="Favorites" className={`transition-all relative ${shouldBeTransparent ? 'text-white/90 hover:text-white hover:scale-110' : 'text-[#1A1A1A] hover:text-[#7A4A2B] hover:scale-110'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favorites.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#7A4A2B] text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </Link>
              <Link href={isAuthenticated ? '/account' : '/login'} aria-label="Account" className={`transition-all relative group ${shouldBeTransparent ? 'text-white/90 hover:text-white hover:scale-110' : 'text-[#1A1A1A] hover:text-[#7A4A2B] hover:scale-110'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {isAuthenticated && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#6B6B6B] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                )}
              </Link>
              <Link href="/cart" aria-label="Cart" className={`transition-colors relative ${shouldBeTransparent ? 'text-white/90 hover:text-white' : 'text-[#1A1A1A] hover:text-[#7A4A2B]'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#7A4A2B] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search" 
                className={`transition-colors ${shouldBeTransparent ? 'text-white hover:text-white/80' : 'text-[#1A1A1A] hover:text-[#7A4A2B]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link href="/cart" aria-label="Cart" className={`transition-colors relative ${shouldBeTransparent ? 'text-white hover:text-white/80' : 'text-[#1A1A1A] hover:text-[#7A4A2B]'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#7A4A2B] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
              <button
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={toggleMenu}
                className={`p-2 focus:outline-none ${shouldBeTransparent ? 'text-white hover:text-white/80' : 'text-[#1A1A1A] hover:text-[#7A4A2B]'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden bg-white border-t border-[#E5E5E5] ${open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-6">
            <div className="flex flex-col gap-4">
              <Link onClick={closeMenu} href="/products" className="text-base text-[#1A1A1A] hover:text-[#B91C1C] font-semibold">Shop All</Link>
              <Link onClick={closeMenu} href="/products?gender=women" className="text-base text-[#1A1A1A] hover:text-[#B91C1C] font-semibold">Women</Link>
              <Link onClick={closeMenu} href="/products?gender=men" className="text-base text-[#1A1A1A] hover:text-[#B91C1C] font-semibold">Men</Link>
              <Link onClick={closeMenu} href="/#collections" className="text-base text-[#1A1A1A] hover:text-[#B91C1C] font-semibold">Collections</Link>
              <Link onClick={closeMenu} href="/favorites" className="text-base text-[#1A1A1A] hover:text-[#B91C1C] font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites
              </Link>
              <div className="border-t border-[#E5E5E5] pt-4 mt-2">
                {isAuthenticated ? (
                    <Link onClick={closeMenu} href="/account" className="text-base text-[#1A1A1A] hover:text-[#B91C1C] font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Account
                  </Link>
                ) : (
                    <Link onClick={closeMenu} href="/login" className="text-base text-[#1A1A1A] hover:text-[#B91C1C] font-semibold flex items-center gap-2">
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
