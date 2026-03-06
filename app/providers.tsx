'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { UserAuthProvider } from '@/context/UserAuthContext'
import { SiteConfigProvider } from '@/context/SiteConfigContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import AppClientEffects from './client-effects'
import type { SiteConfig } from '@/lib/siteConfig'

const CartDrawer = dynamic(() => import('@/components/CartDrawer'), {
  ssr: false,
  loading: () => null,
})

interface AppProvidersProps {
  children: ReactNode
  initialSiteConfig?: SiteConfig | null
}

export default function AppProviders({ children, initialSiteConfig = null }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <SiteConfigProvider initialConfig={initialSiteConfig}>
        <UserAuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <AppClientEffects />
              <CartDrawer />
              {children}
            </FavoritesProvider>
          </CartProvider>
        </UserAuthProvider>
      </SiteConfigProvider>
    </ErrorBoundary>
  )
}