'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dumbbell, Zap, TrendingUp, Flame } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { useWorkout } from '@/stores/workout'
import { t, type Locale } from '@/i18n'

type User = { id?: string | null; name?: string | null; image?: string | null }

interface Stats {
  streak: number
  weeklyVolumeKg: number
  totalWorkouts: number
}

interface PR {
  exerciseName: string
  type: string
  value: number
}

interface RecentWorkout {
  id: string
  name: string
  startedAt: string
  totalSets: number | null
  totalVolumeKg: number | null
  durationSec: number | null
}

function getGreeting(lang: Locale): string {
  const h = new Date().getHours()
  if (h < 12) return t(lang, 'home.morning')
  if (h < 18) return t(lang, 'home.afternoon')
  return t(lang, 'home.evening')
}

function fmtDuration(sec: number | null | undefined): string {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`
}

export function HomeClient({ user }: { user: User }) {
  const lang = useProfile(s => s.language) as Locale
  const active = useWorkout(s => s.active)
  const firstName = user.name?.split(' ')[0] ?? 'Atleta'

  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPRs, setRecentPRs] = useState<PR[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/progress').then(r => r.ok ? r.json() : null),
      fetch(`/api/prs?lang=${lang}`).then(r => r.ok ? r.json() : []),
      fetch('/api/workouts').then(r => r.ok ? r.json() : []),
    ]).then(([progress, prs, wkts]) => {
      if (progress) setStats({ streak: progress.streak, weeklyVolumeKg: progress.weeklyVolumeKg, totalWorkouts: progress.totalWorkouts })
      // Keep only the 3 most recent unique-exercise PRs
      const seen = new Set<string>()
      const best: PR[] = []
      for (const pr of prs) {
        if (pr.type !== 'weight') continue
        if (seen.has(pr.exerciseId)) continue
        seen.add(pr.exerciseId)
        best.push({ exerciseName: pr.exerciseName ?? pr.exerciseId, type: pr.type, value: pr.value })
        if (best.length >= 3) break
      }
      setRecentPRs(best)
      setRecentWorkouts((wkts ?? []).slice(0, 3))
    }).catch(() => {})
  }, [lang])

  const weeklyVolDisplay = stats ? (stats.weeklyVolumeKg >= 1000
    ? `${(stats.weeklyVolumeKg / 1000).toFixed(1)}t`
    : `${Math.round(stats.weeklyVolumeKg)}`) : '—'

  return (
    <div className="min-h-screen px-4 py-6 space-y-6 pb-28">
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
        <StatCard
          icon={<Flame size={18} className="text-warning" />}
          label={t(lang, 'home.streak')}
          value={stats ? String(stats.streak) : '—'}
          unit="days"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-success" />}
          label={t(lang, 'home.weeklyVol')}
          value={weeklyVolDisplay}
          unit="kg"
        />
        <StatCard
          icon={<Zap size={18} className="text-accent" />}
          label="Total"
          value={stats ? String(stats.totalWorkouts) : '—'}
          unit={lang === 'it' ? 'allenamenti' : 'workouts'}
        />
      </div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-t3 font-medium uppercase tracking-wider">🏆 Personal Records</p>
          </div>
          <div className="space-y-2">
            {recentPRs.map((pr, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-t2 text-sm truncate max-w-[60%]">{pr.exerciseName}</span>
                <span className="text-warning font-semibold text-sm">{pr.value} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-t3 font-medium uppercase tracking-wider px-1">
            {lang === 'it' ? 'Ultimi allenamenti' : 'Recent workouts'}
          </p>
          {recentWorkouts.map(w => (
            <Link key={w.id} href="/progress" className="card-2 p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Dumbbell size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-t1 font-medium text-sm truncate">{w.name}</p>
                <p className="text-t3 text-xs">
                  {new Date(w.startedAt).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { month: 'short', day: 'numeric' })}
                  {' · '}
                  {fmtDuration(w.durationSec)}
                  {' · '}
                  {w.totalSets ?? 0} sets
                </p>
              </div>
              {w.totalVolumeKg && (
                <span className="text-t3 text-xs shrink-0">{Math.round(w.totalVolumeKg)} kg</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* AI Insight */}
      <AIInsightCard lang={lang} />

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
      <div className="flex items-center gap-1.5">{icon}<span className="text-t3 text-xs truncate">{label}</span></div>
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

function AIInsightCard({ lang }: { lang: Locale }) {
  const [insight, setInsight] = useState<{ content: string; type: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/insights?lang=${lang}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.content) setInsight(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [lang])

  if (loading || !insight) return null

  const emoji = insight.type === 'warning' ? '⚠️' : insight.type === 'suggestion' ? '💡' : '✨'

  return (
    <div className="card p-4 space-y-2 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <p className="text-xs text-t3 font-medium uppercase tracking-wider">{emoji} {t(lang, 'home.aiInsight')}</p>
      <p className="text-t2 text-sm leading-relaxed">{insight.content}</p>
    </div>
  )
}
