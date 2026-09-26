'use client'

import Link from 'next/link'
import { Dumbbell, Zap, TrendingUp, Flame } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { useWorkout } from '@/stores/workout'
import { t, type Locale } from '@/i18n'

type User = { id?: string | null; name?: string | null; image?: string | null }

function getGreeting(lang: Locale): string {
  const h = new Date().getHours()
  if (h < 12) return t(lang, 'home.morning')
  if (h < 18) return t(lang, 'home.afternoon')
  return t(lang, 'home.evening')
}

export function HomeClient({ user }: { user: User }) {
  const lang = useProfile(s => s.language)
  const active = useWorkout(s => s.active)
  const firstName = user.name?.split(' ')[0] ?? 'Atleta'

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-t3 text-sm">{getGreeting(lang)},</p>
          <h1 className="text-2xl font-bold text-t1">{firstName} 👋</h1>
        </div>
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name ?? ''} className="w-10 h-10 rounded-full border border-white/10" />
        )}
      </header>

      {/* Active workout banner */}
      {active && (
        <Link href="/workout" className="block card p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Dumbbell size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-t3">{t(lang, 'workout.active')}</p>
              <p className="text-t1 font-semibold">{active.name}</p>
            </div>
            <span className="text-primary text-sm font-medium">▶ Continua</span>
          </div>
        </Link>
      )}

      {/* Quick start */}
      {!active && (
        <Link
          href="/workout"
          className="block card p-5 bg-gradient-to-br from-primary/15 to-accent/10 border-primary/20 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Dumbbell size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-t1">{t(lang, 'home.startWorkout')}</h2>
              <p className="text-t3 text-sm">{t(lang, 'home.quickStart')}</p>
            </div>
          </div>
        </Link>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Flame size={18} className="text-warning" />} label={t(lang, 'home.streak')} value="0" unit="days" />
        <StatCard icon={<TrendingUp size={18} className="text-success" />} label={t(lang, 'home.weeklyVol')} value="0" unit="kg" />
        <StatCard icon={<Zap size={18} className="text-accent" />} label="PRs" value="0" unit={t(lang, 'home.thisWeek')} />
      </div>

      {/* AI Insight placeholder */}
      <div className="card p-4 space-y-2">
        <p className="text-xs text-t3 font-medium uppercase tracking-wider">{t(lang, 'home.aiInsight')}</p>
        <p className="text-t2 text-sm">{t(lang, 'home.noInsights')}</p>
      </div>

      {/* Program quick nav */}
      <div className="grid grid-cols-2 gap-3">
        <NavCard href="/programs" icon="📋" label={t(lang, 'nav.programs')} />
        <NavCard href="/exercises" icon="📚" label={t(lang, 'nav.exercises')} />
        <NavCard href="/progress" icon="📈" label={t(lang, 'nav.progress')} />
        <NavCard href="/coach" icon="🤖" label={t(lang, 'nav.coach')} />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="card p-3 space-y-1">
      <div className="flex items-center gap-1.5">{icon}<span className="text-t3 text-xs">{label}</span></div>
      <p className="text-xl font-bold text-t1">{value}</p>
      <p className="text-t3 text-xs">{unit}</p>
    </div>
  )
}

function NavCard({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="card-2 p-4 flex items-center gap-3 active:scale-[0.97] transition-transform">
      <span className="text-2xl">{icon}</span>
      <span className="text-t1 font-medium text-sm">{label}</span>
    </Link>
  )
}
