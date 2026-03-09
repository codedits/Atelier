import { Metadata } from 'next'
import AdminCollectionsClientPage from './AdminCollectionsClientPage'

export const metadata: Metadata = {
    title: 'Admin - Collections | Atelier',
    description: 'Manage exclusive product collections',
}

export default function AdminCollectionsPage() {
    return <AdminCollectionsClientPage />
}
