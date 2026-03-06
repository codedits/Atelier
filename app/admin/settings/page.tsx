import { Metadata } from 'next'
import AdminSettingsClientPage from './AdminSettingsClientPage'

export const metadata: Metadata = {
  title: 'Settings — Atelier Admin',
}

export default function Page() {
  return <AdminSettingsClientPage />
}