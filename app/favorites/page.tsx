import type { Metadata } from 'next'
import FavoritesClientPage from './FavoritesClientPage'

export const metadata: Metadata = {
  title: 'My Favorites — Atelier',
  description: 'Your favorite jewelry pieces from Atelier',
}

export default function FavoritesPage() {
  return <FavoritesClientPage />
}