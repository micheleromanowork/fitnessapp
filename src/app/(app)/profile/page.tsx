import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return <ProfileClient user={session.user} />
}
