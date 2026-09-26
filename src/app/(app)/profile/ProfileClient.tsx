'use client'

import { signOut } from 'next-auth/react'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'
import { LogOut, Globe, Scale } from 'lucide-react'

type User = { id?: string | null; name?: string | null; email?: string | null; image?: string | null }

export function ProfileClient({ user }: { user: User }) {
  const lang = useProfile(s => s.language)
  const units = useProfile(s => s.units)
  const setProfile = useProfile(s => s.set)

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-t1">{t(lang, 'nav.profile')}</h1>

      {/* User card */}
      <div className="card p-5 flex items-center gap-4">
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name ?? ''} className="w-16 h-16 rounded-full border-2 border-primary/30" />
        )}
        <div>
          <p className="text-t1 font-semibold text-lg">{user.name}</p>
          <p className="text-t3 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Settings */}
      <div className="card divide-y divide-white/[0.06]">
        {/* Language */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-t3" />
            <span className="text-t2 text-sm">{t(lang, 'profile.language')}</span>
          </div>
          <select
            value={lang}
            onChange={e => setProfile({ language: e.target.value as 'it' | 'en' })}
            className="bg-transparent text-t1 text-sm focus:outline-none"
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Units */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale size={18} className="text-t3" />
            <span className="text-t2 text-sm">{t(lang, 'profile.units')}</span>
          </div>
          <select
            value={units}
            onChange={e => setProfile({ units: e.target.value as 'metric' | 'imperial' })}
            className="bg-transparent text-t1 text-sm focus:outline-none"
          >
            <option value="metric">kg / cm</option>
            <option value="imperial">lbs / in</option>
          </select>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="btn-danger w-full gap-2"
      >
        <LogOut size={18} />
        {t(lang, 'auth.signOut')}
      </button>
    </div>
  )
}
