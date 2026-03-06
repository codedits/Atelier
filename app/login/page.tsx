import type { Metadata } from 'next'
import LoginClientPage from './LoginClientPage'

export const metadata: Metadata = {
  title: 'Sign In | Atelier',
  description: 'Sign in to your Atelier account',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  return <LoginClientPage redirect={params.redirect} />
}
