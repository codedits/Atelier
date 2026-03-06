import { Metadata } from 'next'
import AdminHomepageClientPage from './AdminHomepageClientPage'

export const metadata: Metadata = {
  title: 'Homepage — Atelier Admin',
}

export default function Page() {
  return <AdminHomepageClientPage />
}