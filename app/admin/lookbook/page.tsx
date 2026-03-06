import { Metadata } from 'next'
import AdminLookbookClientPage from './AdminLookbookClientPage'

export const metadata: Metadata = {
  title: 'Lookbook — Atelier Admin',
}

export default function Page() {
  return <AdminLookbookClientPage />
}