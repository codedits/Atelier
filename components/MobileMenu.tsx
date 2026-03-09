'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useUserAuth } from '@/context/UserAuthContext'
import { useSiteConfig } from '@/context/SiteConfigContext'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'

interface CategoryNav {
    id: string;
    name: string;
}

interface CollectionNav {
    id: string;
    name: string;
    slug: string;
}

const DEFAULT_CATEGORY_NAV: CategoryNav[] = [
    { id: 'cat-rings', name: 'Rings' },
    { id: 'cat-necklaces', name: 'Necklaces' },
    { id: 'cat-bracelets', name: 'Bracelets' },
    { id: 'cat-earrings', name: 'Earrings' },
    { id: 'cat-watches', name: 'Watches' },
]

const DEFAULT_COLLECTION_NAV: CollectionNav[] = [
    { id: 'col-rings', name: 'Rings', slug: 'rings' },
    { id: 'col-necklaces', name: 'Necklaces', slug: 'necklaces' },
    { id: 'col-watches', name: 'Watches', slug: 'watches' },
]

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const pathname = usePathname()
    const { isAuthenticated, user } = useUserAuth()
    const { config } = useSiteConfig()
    const [isMounted, setIsMounted] = useState(false)
    const [collections, setCollections] = useState<CollectionNav[]>(DEFAULT_COLLECTION_NAV)
    const [categories, setCategories] = useState<CategoryNav[]>(DEFAULT_CATEGORY_NAV)

    useEffect(() => {
        setIsMounted(true)

        async function fetchData() {
            try {
                const [collectionsRes, categoriesRes] = await Promise.all([
                    fetch('/api/collections'),
                    fetch('/api/categories')
                ])

                if (collectionsRes.ok) {
                    const collectionsData = await collectionsRes.json()
                    if (Array.isArray(collectionsData) && collectionsData.length > 0) {
                        setCollections(collectionsData)
                    }
                }

                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json()
                    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
                        setCategories(categoriesData)
                    }
                }
            } catch (err) {
                console.error('Failed to fetch navigation data', err)
            }
        }

        fetchData()
    }, [])

    // Prevent background scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Close menu when pathname changes
    useEffect(() => {
        if (isOpen) onClose()
    }, [pathname])

    if (!isMounted) return null

    const menuItems = config?.nav_menu && config.nav_menu.length > 0
        ? config.nav_menu
        : [{ id: 'shop-all', label: 'Shop All', href: '/products' }]

    return (
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] lg:hidden",
                isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
            )}
        >
            {/* Premium Background Layer */}
            <div className="absolute inset-0 bg-white z-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] to-white/50 z-0 pointer-events-none" />

            {/* Floating Close Button at Top Right */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-[1010] w-12 h-12 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-all active:scale-90"
                aria-label="Close menu"
            >
                <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Content Wrapper */}
            <div className="relative z-[1005] h-full flex flex-col pt-20 pb-12 overflow-y-auto px-8 md:px-12">

                {/* Brand Identifier */}
                <div className="mb-16 flex justify-center">
                    <Link href="/" onClick={onClose} className="transition-all hover:opacity-70 active:scale-95">
                        <Image
                            src="/atelier.svg"
                            alt={SITE_NAME}
                            width={160}
                            height={50}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                </div>

                {/* Navigation Blocks */}
                <div className="flex-1 flex flex-col gap-12 max-w-lg mx-auto w-full">

                    {/* Primary Links - Large & Bold */}
                    <div className="space-y-4">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#C9A96E] font-bold mb-6">Collections</p>
                        <nav className="flex flex-col gap-3">
                            {/* Home Link */}
                            <Link
                                href="/"
                                className={cn(
                                    "text-4xl md:text-5xl font-display text-[#1A1A1A] hover:text-[#C9A96E] transition-all transform hover:translate-x-2 duration-300",
                                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                                )}
                                style={{ transitionDelay: `150ms` }}
                                onClick={onClose}
                            >
                                Home
                            </Link>

                            <div className="h-px bg-[#F0F0F0] my-2 w-full opacity-50" />
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-2">Shop</p>

                            {/* Categories (Male, Female, Unisex) */}
                            {categories.length > 0 && categories.map((cat, idx) => (
                                <Link
                                    key={cat.id}
                                    href={`/products?category=${cat.name.toLowerCase()}`}
                                    className={cn(
                                        "text-3xl md:text-4xl font-display text-[#1A1A1A] hover:text-[#C9A96E] transition-all transform hover:translate-x-2 duration-300",
                                        isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                                    )}
                                    style={{ transitionDelay: `${250 + idx * 50}ms` }}
                                    onClick={onClose}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                            <Link
                                href="/products"
                                className={cn(
                                    "text-2xl font-display text-[#1A1A1A]/70 hover:text-[#C9A96E] transition-all transform hover:translate-x-2 duration-300",
                                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                                )}
                                style={{ transitionDelay: `${300 + categories.length * 50}ms` }}
                                onClick={onClose}
                            >
                                Shop All
                            </Link>

                            {/* Collections List */}
                            {collections.length > 0 && (
                                <>
                                    <div className="h-px bg-[#F0F0F0] my-4 w-full opacity-50" />
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-2">Curated Collections</p>
                                    <div className="flex flex-col gap-4">
                                        {collections.map((c, idx) => (
                                            <Link
                                                key={c.id}
                                                href={`/collections/${c.slug}`}
                                                className={cn(
                                                    "text-2xl font-display text-[#1A1A1A]/80 hover:text-[#C9A96E] transition-all transform hover:translate-x-2 duration-300",
                                                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                                                )}
                                                style={{ transitionDelay: `${300 + idx * 40}ms` }}
                                                onClick={onClose}
                                            >
                                                {c.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Secondary Sections Grid */}
                    <div className="grid grid-cols-2 gap-12 pt-12 border-t border-[#F0F0F0]">
                        <div className="space-y-6">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold">Account</p>
                            <nav className="flex flex-col gap-4">
                                <Link href="/favorites" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C9A96E] flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" /></svg>
                                    Wishlist
                                </Link>
                                <Link href={isAuthenticated ? "/account" : "/login"} className="text-sm font-medium text-[#1A1A1A] hover:text-[#C9A96E] flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor" /></svg>
                                    {isAuthenticated ? (user?.name || "Profile") : "Sign In"}
                                </Link>
                            </nav>
                        </div>

                        <div className="space-y-6">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold">Support</p>
                            <nav className="flex flex-col gap-4">
                                <Link href="/faq" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C9A96E]">FAQ</Link>
                                <Link href="/shipping-info" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C9A96E]">Shipping</Link>
                                <Link href="/returns" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C9A96E]">Returns</Link>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Social & Contact Footer */}
                <div className="mt-16 pt-12 border-t border-[#F0F0F0] max-w-lg mx-auto w-full text-center space-y-8">
                    <div className="flex justify-center gap-8">
                        {['Instagram', 'Pinterest', 'Facebook'].map(social => (
                            <a
                                key={social}
                                href="#"
                                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#C9A96E] transition-colors"
                            >
                                {social}
                            </a>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] text-[#A1A1A1] tracking-widest uppercase">Contact Us</p>
                        <p className="text-sm font-medium text-[#1A1A1A]">support@ateliertheart.com</p>
                    </div>
                    <p className="text-[9px] text-[#D1D1D1] uppercase tracking-[0.3em] font-medium pt-4">
                        &copy; {new Date().getFullYear()} {SITE_NAME}
                    </p>
                </div>
            </div>
        </div>
    )
}
