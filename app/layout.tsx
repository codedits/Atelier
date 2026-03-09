import type { Metadata } from 'next'
import { Cormorant_Garamond, Poppins } from 'next/font/google'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, DEFAULT_OG, KEYWORDS } from '@/lib/constants'
import { getCachedSiteConfig } from '@/lib/cache'
import AppProviders from './providers'
import '@/styles/globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-cormorant',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: KEYWORDS,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Luxury handcrafted jewelry`,
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@atelier',
    creator: '@atelier',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/atelier.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSiteConfig = await getCachedSiteConfig()

  // Inject CSS variables server-side to prevent CLS/FOUC
  const colors = initialSiteConfig?.theme_colors
  const cssVars: Record<string, string> = {}
  if (colors) {
    if (colors.primary) cssVars['--color-primary'] = colors.primary
    if (colors.secondary) cssVars['--color-secondary'] = colors.secondary
    if (colors.accent) cssVars['--color-accent'] = colors.accent
    if (colors.text) cssVars['--color-text'] = colors.text
    if (colors.text_light) cssVars['--color-text-light'] = colors.text_light
  }

  return (
    <html lang="en" style={{ ...cssVars as React.CSSProperties, minHeight: '100vh' }} className="js" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');`,
          }}
        />
      </head>
      <body className={`${cormorant.variable} ${poppins.variable} min-h-screen flex flex-col`}>
        <AppProviders initialSiteConfig={initialSiteConfig}>{children}</AppProviders>
      </body>
    </html>
  )
}