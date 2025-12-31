import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, memo } from 'react'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { UserAuthProvider } from '@/context/UserAuthContext'
import '../styles/globals.css'

const SITE_NAME = 'Atelier Fine Jewellery'
const SITE_DESCRIPTION = 'Discover exquisite handcrafted fine jewellery at Atelier. Shop luxury rings, necklaces, bracelets, and earrings crafted by master artisans with premium materials.'
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://atelier-amber.vercel.app'
const DEFAULT_OG = '/og-image.jpg'
const KEYWORDS = 'fine jewellery, luxury jewelry, handcrafted rings, gold necklaces, diamond earrings, bracelets, artisan jewelry, premium accessories'

// Memoized page component wrapper for performance
const MemoizedComponent = memo(function MemoizedComponent({ Component, pageProps }: { Component: AppProps['Component'], pageProps: AppProps['pageProps'] }) {
  return <Component {...pageProps} />
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Prefetch critical routes on mount for faster navigation (only on idle)
  useEffect(() => {
    const criticalRoutes = ['/products', '/cart', '/favorites']
    
    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
        criticalRoutes.forEach(route => router.prefetch(route))
      })
    } else {
      // Fallback with setTimeout for browsers without requestIdleCallback
      setTimeout(() => {
        criticalRoutes.forEach(route => router.prefetch(route))
      }, 1000)
    }
  }, [router])

  return (
    <UserAuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <meta name="description" content={SITE_DESCRIPTION} />
          <meta name="keywords" content={KEYWORDS} />
          <meta name="theme-color" content="#030303" />
          
          {/* DNS Prefetch for external resources */}
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
          <link rel="dns-prefetch" href="https://images.pexels.com" />
          <link rel="dns-prefetch" href="https://images.unsplash.com" />
          
          {/* Preconnect to critical origins */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* Open Graph */}
          <meta property="og:site_name" content={SITE_NAME} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={SITE_URL} />
          <meta property="og:title" content={SITE_NAME} />
          <meta property="og:description" content={SITE_DESCRIPTION} />
          <meta property="og:image" content={`${SITE_URL}${DEFAULT_OG}`} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="Atelier Fine Jewellery - Luxury handcrafted jewelry" />
          <meta property="og:locale" content="en_US" />
          
          {/* Twitter Cards */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@atelier" />
          <meta name="twitter:creator" content="@atelier" />
          <meta name="twitter:title" content={SITE_NAME} />
          <meta name="twitter:description" content={SITE_DESCRIPTION} />
          <meta name="twitter:image" content={`${SITE_URL}${DEFAULT_OG}`} />
          <meta name="twitter:image:alt" content="Atelier Fine Jewellery" />

          {/* Canonical - pages can override if needed */}
          <link rel="canonical" href={SITE_URL} />
          </Head>
          <MemoizedComponent Component={Component} pageProps={pageProps} />
        </FavoritesProvider>
      </CartProvider>
    </UserAuthProvider>
  )
}
