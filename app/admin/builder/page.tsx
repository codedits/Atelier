import { Metadata } from 'next'
import AdminBuilderClientPage from './AdminBuilderClientPage'

export const metadata: Metadata = {
  title: 'Builder | Atelier Admin',
}

export default function Page() {
  return <AdminBuilderClientPage />
}