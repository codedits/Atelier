import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { UserAuthProvider } from '@/context/UserAuthContext'
import '../styles/globals.css'

const SITE_NAME = 'Atelier'
const SITE_DESCRIPTION = 'Atelier — Exquisite handcrafted fine jewellery'
const SITE_URL = 'https://codedits.github.io/Atelier'
const DEFAULT_OG = '/og-image.jpg'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Prefetch critical routes on mount for faster navigation
  useEffect(() => {
    const criticalRoutes = ['/products', '/cart', '/favorites']
    criticalRoutes.forEach(route => router.prefetch(route))
  }, [router])

  return (
    <UserAuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content={SITE_DESCRIPTION} />
          <meta name="theme-color" content="#000" />

          {/* Open Graph / Twitter */}
          <meta property="og:site_name" content={SITE_NAME} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={SITE_URL} />
          <meta property="og:title" content={SITE_NAME} />
          <meta property="og:description" content={SITE_DESCRIPTION} />
          <meta property="og:image" content={DEFAULT_OG} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={SITE_NAME} />
          <meta name="twitter:description" content={SITE_DESCRIPTION} />

          {/* Canonical - pages can override if needed */}
          <link rel="canonical" href={SITE_URL} />
          </Head>
          <Component {...pageProps} />
        </FavoritesProvider>
      </CartProvider>
    </UserAuthProvider>
  )
}
