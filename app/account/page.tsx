import type { Metadata } from 'next'
import AccountClientPage from './AccountClientPage'

export const metadata: Metadata = {
  title: 'My Account | Atelier',
  description: 'Manage your Atelier account',
}

export default function AccountPage() {
  return <AccountClientPage />
}
