import type { Metadata } from 'next'
import OrderDetailClientPage from './OrderDetailClientPage'

export const metadata: Metadata = {
  title: 'Order Details | Atelier',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderDetailClientPage orderId={id} />
}
