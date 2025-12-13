import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useUserAuth } from '@/context/UserAuthContext'
import { useFavorites } from '@/context/FavoritesContext'

export default function Header() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { totalItems } = useCart()
  const { isAuthenticated, user } = useUserAuth()
  const { favorites } = useFavorites()

  // Check if current page matches the link
  const isActive = (path: string) => {
    if (path === '/products' && router.pathname === '/products' && !router.query.gender) return true
    if (path.includes('?gender=')) {
      const gender = path.split('gender=')[1]
      return router.pathname === '/products' && router.query.gender === gender
    }
    return router.pathname === path
  }

  return (
    <>
      {/* Promotional Banner */}
      <div className="bg-[#1A1A1A] text-white text-center py-2.5 px-4">
        <p className="text-xs font-medium tracking-wide">✨ Free shipping on orders over ₨5,000 | Free returns</p>
      </div>
      
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-display text-xl tracking-[0.05em] text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors">
              ATELIER
            </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className={`text-sm transition-colors font-medium relative ${isActive('/products') ? 'text-[#D4A5A5]' : 'text-[#1A1A1A] hover:text-[#D4A5A5]'}`}>
              Shop All
              {isActive('/products') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4A5A5] rounded-full" />}
            </Link>
            <Link href="/products?gender=women" className={`text-sm transition-colors font-medium relative ${isActive('/products?gender=women') ? 'text-[#D4A5A5]' : 'text-[#1A1A1A] hover:text-[#D4A5A5]'}`}>
              Women
              {isActive('/products?gender=women') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4A5A5] rounded-full" />}
            </Link>
            <Link href="/products?gender=men" className={`text-sm transition-colors font-medium relative ${isActive('/products?gender=men') ? 'text-[#D4A5A5]' : 'text-[#1A1A1A] hover:text-[#D4A5A5]'}`}>
              Men
              {isActive('/products?gender=men') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4A5A5] rounded-full" />}
            </Link>
            <Link href="/#collections" className="text-sm text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors font-medium">Collections</Link>
          </nav>            <div className="hidden md:flex items-center gap-6">
              <button aria-label="Search" className="text-[#1A1A1A] hover:text-[#D4A5A5] hover:scale-110 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link href="/favorites" aria-label="Favorites" className="text-[#1A1A1A] hover:text-[#D4A5A5] hover:scale-110 transition-all relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#D4A5A5] text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </Link>
              <Link href={isAuthenticated ? '/account' : '/login'} aria-label="Account" className="text-[#1A1A1A] hover:text-[#D4A5A5] hover:scale-110 transition-all relative group">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {isAuthenticated && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#6B6B6B] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                )}
              </Link>
              <Link href="/cart" aria-label="Cart" className="text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4A5A5] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
              <Link href="/cart" aria-label="Cart" className="text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4A5A5] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
              <button
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className="p-2 text-[#1A1A1A] hover:text-[#D4A5A5] focus:outline-none"
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
              <Link onClick={() => setOpen(false)} href="/products" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium">Shop All</Link>
              <Link onClick={() => setOpen(false)} href="/products?gender=women" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium">Women</Link>
              <Link onClick={() => setOpen(false)} href="/products?gender=men" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium">Men</Link>
              <Link onClick={() => setOpen(false)} href="/#collections" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium">Collections</Link>
              <Link onClick={() => setOpen(false)} href="/favorites" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites
              </Link>
              <div className="border-t border-[#E5E5E5] pt-4 mt-2">
                {isAuthenticated ? (
                  <Link onClick={() => setOpen(false)} href="/account" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Account
                  </Link>
                ) : (
                  <Link onClick={() => setOpen(false)} href="/login" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium flex items-center gap-2">
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
}
