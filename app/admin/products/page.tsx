import { Metadata } from 'next'
import AdminProductsClientPage from './AdminProductsClientPage'

export const metadata: Metadata = {
  title: 'Products — Atelier Admin',
}

export default function Page() {
  return <AdminProductsClientPage />
}