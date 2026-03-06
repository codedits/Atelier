import type { Metadata } from 'next'
import CheckoutClientPage from './CheckoutClientPage'

export const metadata: Metadata = {
  title: 'Checkout — Atelier',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutPage() {
  return <CheckoutClientPage />
}
