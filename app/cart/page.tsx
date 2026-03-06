import type { Metadata } from 'next'
import CartClientPage from './CartClientPage'

export const metadata: Metadata = {
  title: 'Shopping Cart — Atelier',
}

export default function CartPage() {
  return <CartClientPage />
}
