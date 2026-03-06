import { Metadata } from 'next'
import AdminOrdersClientPage from './AdminOrdersClientPage'

export const metadata: Metadata = {
  title: 'Orders — Atelier Admin',
}

export default function Page() {
  return <AdminOrdersClientPage />
}