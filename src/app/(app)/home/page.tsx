import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { HomeClient } from './HomeClient'

export default async function HomePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return <HomeClient user={session.user} />
}
