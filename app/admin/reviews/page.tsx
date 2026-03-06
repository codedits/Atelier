import { Metadata } from 'next'
import AdminReviewsClientPage from './AdminReviewsClientPage'

export const metadata: Metadata = {
  title: 'Reviews — Atelier Admin',
}

export default function Page() {
  return <AdminReviewsClientPage />
}