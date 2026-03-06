'use client'

import { ReactNode } from 'react'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { UserAuthProvider } from '@/context/UserAuthContext'
import { SiteConfigProvider } from '@/context/SiteConfigContext'
import CartDrawer from '@/components/CartDrawer'
import ErrorBoundary from '@/components/ErrorBoundary'
import AppClientEffects from './client-effects'

interface AppProvidersProps {
  children: ReactNode
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <SiteConfigProvider>
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