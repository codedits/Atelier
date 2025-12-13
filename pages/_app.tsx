import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { UserAuthProvider } from '@/context/UserAuthContext'
import '../styles/globals.css'

const SITE_NAME = 'Atelier Fine Jewellery'
const SITE_DESCRIPTION = 'Discover exquisite handcrafted fine jewellery at Atelier. Shop luxury rings, necklaces, bracelets, and earrings crafted by master artisans with premium materials.'
const SITE_URL = 'https://codedits.github.io/Atelier'
const DEFAULT_OG = '/og-image.jpg'
const KEYWORDS = 'fine jewellery, luxury jewelry, handcrafted rings, gold necklaces, diamond earrings, bracelets, artisan jewelry, premium accessories'

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
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <meta name="description" content={SITE_DESCRIPTION} />
          <meta name="keywords" content={KEYWORDS} />
          <meta name="theme-color" content="#030303" />

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
          <Component {...pageProps} />
        </FavoritesProvider>
      </CartProvider>
    </UserAuthProvider>
  )
}
