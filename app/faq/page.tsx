import type { Metadata } from 'next'
import FAQClientPage from './FAQClientPage'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `FAQs | ${SITE_NAME}`,
  description: `Frequently asked questions about ${SITE_NAME} jewelry, shipping, returns, warranties, and custom design.`,
  openGraph: {
    title: `FAQs | ${SITE_NAME}`,
    description: `Frequently asked questions about ${SITE_NAME} jewelry, shipping, returns, warranties, and custom design.`,
  },
}

export default function FAQPage() {
  return <FAQClientPage />
}
