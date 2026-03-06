import { Metadata } from 'next'
import AdminCategoriesClientPage from './AdminCategoriesClientPage'

export const metadata: Metadata = {
  title: 'Categories — Atelier Admin',
}

export default function Page() {
  return <AdminCategoriesClientPage />
}