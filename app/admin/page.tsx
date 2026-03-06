import { Metadata } from 'next'
import AdminLoginClientPage from './AdminLoginClientPage'

export const metadata: Metadata = {
  title: 'Admin Login | Atelier',
}

export default function AdminPage() {
  return <AdminLoginClientPage />
}
