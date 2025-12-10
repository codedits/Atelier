import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Promotional Banner */}
      <div className="bg-[#1A1A1A] text-white text-center py-2 px-4">
        <p className="text-xs font-medium">Free shipping on orders over $100 | Free returns</p>
      </div>
      
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-display text-xl tracking-[0.05em] text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors">
              ATELIER
            </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/products" className="text-sm text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors font-medium">Shop All</a>
            <a href="#women" className="text-sm text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors font-medium">Women</a>
            <a href="#men" className="text-sm text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors font-medium">Men</a>
            <a href="#collections" className="text-sm text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors font-medium">Collections</a>
          </nav>            <div className="hidden md:flex items-center gap-6">
              <button aria-label="Search" className="text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button aria-label="Account" className="text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button aria-label="Cart" className="text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
              className="md:hidden p-2 text-[#1A1A1A] hover:text-[#D4A5A5] focus:outline-none"
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

        {/* Mobile menu panel */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden bg-white border-t border-[#E5E5E5] ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-6">
            <div className="flex flex-col gap-4">
              <a onClick={() => setOpen(false)} href="/products" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium">Shop All</a>
              <a onClick={() => setOpen(false)} href="#women" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium">Women</a>
              <a onClick={() => setOpen(false)} href="#men" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium">Men</a>
              <a onClick={() => setOpen(false)} href="#collections" className="text-base text-[#1A1A1A] hover:text-[#D4A5A5] font-medium">Collections</a>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
