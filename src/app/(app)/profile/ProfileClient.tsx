'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useProfile } from '@/stores/profile'
import { t, type Locale } from '@/i18n'
import { LogOut, Globe, Scale, Timer, Zap, Dumbbell, Flame, Trophy, Download, Sun } from 'lucide-react'

type User = { id?: string | null; name?: string | null; email?: string | null; image?: string | null }

interface Stats {
  totalWorkouts: number
  streak: number
  weeklyVolumeKg: number
}

interface Badge {
  id: string
  emoji: string
  labelEn: string
  labelIt: string
  condition: (s: Stats) => boolean
}

const BADGES: Badge[] = [
  { id: 'first', emoji: '🏋️', labelEn: 'First Workout', labelIt: 'Primo allenamento', condition: s => s.totalWorkouts >= 1 },
  { id: 'w10', emoji: '💪', labelEn: '10 Workouts', labelIt: '10 allenamenti', condition: s => s.totalWorkouts >= 10 },
  { id: 'w25', emoji: '🥈', labelEn: '25 Workouts', labelIt: '25 allenamenti', condition: s => s.totalWorkouts >= 25 },
  { id: 'w50', emoji: '🥇', labelEn: '50 Workouts', labelIt: '50 allenamenti', condition: s => s.totalWorkouts >= 50 },
  { id: 'w100', emoji: '💯', labelEn: '100 Workouts', labelIt: '100 allenamenti', condition: s => s.totalWorkouts >= 100 },
  { id: 's7', emoji: '🔥', labelEn: '7-Day Streak', labelIt: 'Streak 7 giorni', condition: s => s.streak >= 7 },
  { id: 's30', emoji: '🔥🔥', labelEn: '30-Day Streak', labelIt: 'Streak 30 giorni', condition: s => s.streak >= 30 },
  { id: 'vol', emoji: '🚀', labelEn: 'Volume Beast', labelIt: 'Bestia del Volume', condition: s => s.weeklyVolumeKg >= 5000 },
]

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-white/20'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

export function ProfileClient({ user }: { user: User }) {
  const lang = useProfile(s => s.language) as Locale
  const units = useProfile(s => s.units)
  const theme = useProfile(s => s.theme)
  const defaultRestSec = useProfile(s => s.defaultRestSec)
  const autoStartTimer = useProfile(s => s.autoStartTimer)
  const setProfile = useProfile(s => s.set)

  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats({ totalWorkouts: d.totalWorkouts, streak: d.streak, weeklyVolumeKg: d.weeklyVolumeKg }) })
      .catch(() => {})
  }, [])

  function handleSetting(patch: Parameters<typeof setProfile>[0]) {
    setProfile(patch)
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {})
  }

  const restOptions = [60, 90, 120, 180, 240]

  return (
    <div className="min-h-screen px-4 py-6 space-y-5 pb-28">
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

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 space-y-1 text-center">
            <Dumbbell size={18} className="text-primary mx-auto" />
            <p className="text-xl font-bold text-t1">{stats.totalWorkouts}</p>
            <p className="text-t3 text-[11px]">{lang === 'it' ? 'Allenamenti' : 'Workouts'}</p>
          </div>
          <div className="card p-3 space-y-1 text-center">
            <Flame size={18} className="text-warning mx-auto" />
            <p className="text-xl font-bold text-t1">{stats.streak}</p>
            <p className="text-t3 text-[11px]">{lang === 'it' ? 'Streak (giorni)' : 'Streak (days)'}</p>
          </div>
          <div className="card p-3 space-y-1 text-center">
            <Trophy size={18} className="text-accent mx-auto" />
            <p className="text-xl font-bold text-t1">
              {stats.weeklyVolumeKg >= 1000
                ? `${(stats.weeklyVolumeKg / 1000).toFixed(1)}t`
                : `${Math.round(stats.weeklyVolumeKg)}`}
            </p>
            <p className="text-t3 text-[11px]">{lang === 'it' ? 'Vol. sett. (kg)' : 'Weekly vol.'}</p>
          </div>
        </div>
      )}

      {/* Achievement badges */}
      {stats && (
        <div className="card p-4 space-y-3">
          <p className="text-t3 text-xs font-medium uppercase tracking-wider">{lang === 'it' ? 'Achievements' : 'Achievements'}</p>
          <div className="flex flex-wrap gap-2">
            {BADGES.map(b => {
              const unlocked = b.condition(stats)
              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    unlocked
                      ? 'bg-warning/15 text-warning border border-warning/30'
                      : 'bg-white/[0.04] text-t3 border border-white/[0.06] opacity-40'
                  }`}
                >
                  <span>{b.emoji}</span>
                  <span>{lang === 'it' ? b.labelIt : b.labelEn}</span>
                </div>
              )
            })}
          </div>
          <p className="text-t3 text-[11px]">
            {BADGES.filter(b => b.condition(stats)).length}/{BADGES.length} {lang === 'it' ? 'sbloccati' : 'unlocked'}
          </p>
        </div>
      )}

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
            onChange={e => handleSetting({ language: e.target.value as 'it' | 'en' })}
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
            onChange={e => handleSetting({ units: e.target.value as 'metric' | 'imperial' })}
            className="bg-transparent text-t1 text-sm focus:outline-none"
          >
            <option value="metric">kg / cm</option>
            <option value="imperial">lbs / in</option>
          </select>
        </div>

        {/* Default rest timer */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer size={18} className="text-t3" />
            <span className="text-t2 text-sm">{t(lang, 'profile.defaultRest')}</span>
          </div>
          <select
            value={defaultRestSec}
            onChange={e => handleSetting({ defaultRestSec: Number(e.target.value) })}
            className="bg-transparent text-t1 text-sm focus:outline-none"
          >
            {restOptions.map(s => (
              <option key={s} value={s}>
                {s < 60 ? `${s}s` : s === 60 ? '1 min' : s === 90 ? '1:30' : s === 120 ? '2 min' : s === 180 ? '3 min' : '4 min'}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-start timer */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-t3" />
            <span className="text-t2 text-sm">{t(lang, 'profile.autoStart')}</span>
          </div>
          <Toggle
            checked={autoStartTimer}
            onChange={v => handleSetting({ autoStartTimer: v })}
          />
        </div>

        {/* Theme */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun size={18} className="text-t3" />
            <span className="text-t2 text-sm">{t(lang, 'profile.theme')}</span>
          </div>
          <select
            value={theme}
            onChange={e => handleSetting({ theme: e.target.value as 'dark' | 'light' | 'system' })}
            className="bg-transparent text-t1 text-sm focus:outline-none"
          >
            <option value="dark">{t(lang, 'profile.dark')}</option>
            <option value="light">{t(lang, 'profile.light')}</option>
            <option value="system">{t(lang, 'profile.system')}</option>
          </select>
        </div>
      </div>

      {/* Export data */}
      <a
        href="/api/profile/export"
        download
        className="btn-ghost w-full gap-2 border border-white/10"
      >
        <Download size={18} />
        {t(lang, 'profile.exportData')}
      </a>

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
