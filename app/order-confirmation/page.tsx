import type { Metadata } from 'next'
import OrderConfirmationClientPage from './OrderConfirmationClientPage'

export const metadata: Metadata = {
  title: 'Order Confirmed — Atelier',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams
  return <OrderConfirmationClientPage orderId={params.id} />
}
