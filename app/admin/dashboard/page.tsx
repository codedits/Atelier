import { Metadata } from 'next'
import AdminDashboardClientPage from './AdminDashboardClientPage'

export const metadata: Metadata = {
  title: 'Overview — Atelier Admin',
}

export default function AdminDashboardPage() {
  return <AdminDashboardClientPage />
}
