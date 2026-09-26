'use client'

import { useState, useEffect, useCallback } from 'react'
import { Flame, TrendingUp, Dumbbell, Clock, Plus, X, ChevronRight, Trophy } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { t, type Locale } from '@/i18n'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface VolWeek { week: string; volumeKg: number; count: number }
interface Stats {
  totalWorkouts: number
  streak: number
  weeklyVolumeKg: number
  avgDurationSec: number
  volumeByWeek: VolWeek[]
  latestMeasurement: Record<string, number | null> | null
}

interface WorkoutRow {
  id: string
  name: string
  startedAt: string
  durationSec: number | null
  totalSets: number | null
  totalVolumeKg: number | null
}

interface WorkoutDetail extends WorkoutRow {
  exercises: {
    id: string
    exerciseId: string
    name: string | null
    order: number | null
    sets: { id: string; setOrder: number; weightKg: number | null; reps: number | null; setType: string; isCompleted: boolean }[]
  }[]
}

function fmtDur(sec: number | null | undefined) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  return m > 0 ? `${m}m` : `${sec}s`
}

function fmtDate(d: string | number, lang: Locale) {
  return new Date(d).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ProgressPage() {
  const lang = useProfile(s => s.language) as Locale
  const units = useProfile(s => s.units)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'stats' | 'body' | 'history' | 'prs'>('stats')
  const [showAddMeasure, setShowAddMeasure] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/progress')
    if (r.ok) setStats(await r.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const wUnit = units === 'imperial' ? 'lbs' : 'kg'

  return (
    <div className="min-h-screen px-4 py-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-t1">{t(lang, 'progress.title')}</h1>
        {tab === 'body' && (
          <button onClick={() => setShowAddMeasure(true)} className="btn-secondary h-9 px-3 gap-1.5 text-sm">
            <Plus size={14} />
            {t(lang, 'progress.addMeasurement')}
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-none">
        {(['stats', 'history', 'prs', 'body'] as const).map(tab_ => (
          <button
            key={tab_}
            onClick={() => setTab(tab_)}
            className={`shrink-0 h-9 px-3 rounded-xl text-xs font-semibold transition-colors ${
              tab === tab_ ? 'bg-primary text-white' : 'bg-[#1a1a24] text-t2'
            }`}
          >
            {tab_ === 'stats' ? t(lang, 'analytics.title')
              : tab_ === 'history' ? (lang === 'it' ? 'Storico' : 'History')
              : tab_ === 'prs' ? 'Records'
              : t(lang, 'progress.measurements')}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-16 text-t3 text-sm">{t(lang, 'common.loading')}</div>}

      {!loading && stats && tab === 'stats' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={<Dumbbell size={18} className="text-primary" />}
              label={t(lang, 'analytics.totalWorkouts')} value={String(stats.totalWorkouts)} />
            <KpiCard icon={<Flame size={18} className="text-warning" />}
              label={t(lang, 'analytics.streak')} value={`${stats.streak}d`} />
            <KpiCard icon={<TrendingUp size={18} className="text-success" />}
              label={t(lang, 'home.weeklyVol')} value={`${stats.weeklyVolumeKg} ${wUnit}`} />
            <KpiCard icon={<Clock size={18} className="text-accent" />}
              label={t(lang, 'analytics.avgDuration')} value={fmtDur(stats.avgDurationSec)} />
          </div>

          <div className="card p-4 space-y-3">
            <p className="text-t2 text-sm font-semibold">{t(lang, 'analytics.volumeOverTime')}</p>
            {stats.volumeByWeek.every(w => w.volumeKg === 0) ? (
              <p className="text-t3 text-sm text-center py-6">{t(lang, 'analytics.noData')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.volumeByWeek} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#6366f1' }}
                    formatter={(v: number) => [`${v} ${wUnit}`, t(lang, 'analytics.volumeOverTime')]}
                  />
                  <Bar dataKey="volumeKg" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {stats.volumeByWeek.some(w => w.count > 0) && (
            <div className="card p-4 space-y-3">
              <p className="text-t2 text-sm font-semibold">{t(lang, 'analytics.totalWorkouts')} / {t(lang, 'common.week')}</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={stats.volumeByWeek} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#06b6d4' }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {!loading && tab === 'history' && <HistoryTab lang={lang} units={units} />}

      {!loading && tab === 'prs' && <PRsTab lang={lang} />}

      {!loading && tab === 'body' && (
        <BodyTab lang={lang} units={units} stats={stats} onAddMeasure={() => setShowAddMeasure(true)} />
      )}

      {showAddMeasure && (
        <AddMeasurementSheet lang={lang} units={units} onClose={() => setShowAddMeasure(false)} onSaved={() => { setShowAddMeasure(false); load() }} />
      )}
    </div>
  )
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ lang, units }: { lang: Locale; units: string }) {
  const wUnit = units === 'imperial' ? 'lbs' : 'kg'
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<WorkoutDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetch('/api/workouts')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setWorkouts(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function openDetail(id: string) {
    setDetailLoading(true)
    try {
      const r = await fetch(`/api/workouts/${id}?lang=${lang}`)
      if (r.ok) setSelected(await r.json())
    } finally {
      setDetailLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-t3 text-sm">{t(lang, 'common.loading')}</div>

  if (workouts.length === 0) return (
    <div className="text-center py-12 text-t3 space-y-2">
      <p className="text-4xl">🏋️</p>
      <p className="text-sm">{t(lang, 'workout.noWorkouts')}</p>
    </div>
  )

  return (
    <>
      <div className="space-y-2">
        {workouts.map(w => (
          <button
            key={w.id}
            onClick={() => openDetail(w.id)}
            className="card-2 w-full p-4 text-left flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Dumbbell size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-t1 font-semibold text-sm truncate">{w.name}</p>
              <p className="text-t3 text-xs mt-0.5">
                {fmtDate(w.startedAt, lang)}
                {' · '}
                {fmtDur(w.durationSec)}
                {' · '}
                {w.totalSets ?? 0} sets
              </p>
            </div>
            <div className="text-right shrink-0">
              {w.totalVolumeKg ? <p className="text-t2 text-xs font-medium">{Math.round(w.totalVolumeKg)} {wUnit}</p> : null}
              <ChevronRight size={16} className="text-t3 mt-0.5 ml-auto" />
            </div>
          </button>
        ))}
      </div>

      {(selected || detailLoading) && (
        <WorkoutDetailModal
          workout={selected}
          loading={detailLoading}
          lang={lang}
          units={units}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

function WorkoutDetailModal({ workout, loading, lang, units, onClose }: {
  workout: WorkoutDetail | null
  loading: boolean
  lang: Locale
  units: string
  onClose: () => void
}) {
  const wUnit = units === 'imperial' ? 'lbs' : 'kg'
  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1 overlay" />
      <div
        className="bg-[#111118] border-t border-white/10 rounded-t-3xl p-5 pb-10 max-h-[85dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center -mt-2 mb-4"><div className="w-10 h-1 bg-white/20 rounded-full" /></div>

        {loading && <div className="text-center py-8 text-t3 text-sm">{t(lang, 'common.loading')}</div>}

        {workout && !loading && (
          <>
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h2 className="text-t1 font-bold text-lg">{workout.name}</h2>
                <p className="text-t3 text-sm mt-0.5">
                  {fmtDate(workout.startedAt, lang)}
                  {workout.durationSec ? ` · ${fmtDur(workout.durationSec)}` : ''}
                  {workout.totalVolumeKg ? ` · ${Math.round(workout.totalVolumeKg)} ${wUnit}` : ''}
                </p>
              </div>
              <button onClick={onClose} className="text-t3 shrink-0"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {workout.exercises.map(ex => (
                <div key={ex.id} className="space-y-2">
                  <p className="text-t1 font-semibold text-sm">{ex.name ?? ex.exerciseId}</p>
                  <div className="space-y-1">
                    {ex.sets.filter(s => s.isCompleted).map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 text-sm text-t2 px-1">
                        <span className="text-t3 text-xs w-5">{i + 1}</span>
                        <span className="font-medium">{s.weightKg ?? 0} {wUnit}</span>
                        <span className="text-t3">×</span>
                        <span className="font-medium">{s.reps ?? 0} reps</span>
                        {s.setType !== 'normal' && (
                          <span className="badge-neutral text-[10px] uppercase">{s.setType}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center gap-2">{icon}<span className="text-t3 text-xs">{label}</span></div>
      <p className="text-2xl font-bold text-t1">{value}</p>
    </div>
  )
}

function MeasurementCard({ m, lang, units }: { m: Record<string, number | null>; lang: Locale; units: string }) {
  const u = units === 'imperial' ? 'lbs' : 'kg'
  const c = 'cm'
  const rows: [string, number | null, string][] = [
    [t(lang, 'progress.weight'), m.weightKg as number | null, u],
    [t(lang, 'progress.chest'), m.chestCm as number | null, c],
    [t(lang, 'progress.waist'), m.waistCm as number | null, c],
    [t(lang, 'progress.arms'), m.leftArmCm as number | null, c],
    [t(lang, 'progress.thighs'), m.leftThighCm as number | null, c],
  ]
  return (
    <div className="card p-4 space-y-3">
      <p className="text-t3 text-xs font-medium uppercase tracking-wider">{t(lang, 'progress.measurements')}</p>
      {rows.filter(([, v]) => v != null).map(([label, val, unit]) => (
        <div key={label} className="flex justify-between items-center py-1 border-b border-white/[0.05]">
          <span className="text-t2 text-sm">{label}</span>
          <span className="text-t1 font-semibold text-sm">{val} {unit}</span>
        </div>
      ))}
    </div>
  )
}

// ── PRs Tab ───────────────────────────────────────────────────────────────────
interface PRRow {
  id: string
  exerciseId: string
  exerciseName: string | null
  type: string
  value: number
  weightKg: number | null
  reps: number | null
  achievedAt: string
}

function PRsTab({ lang }: { lang: Locale }) {
  const [prs, setPrs] = useState<PRRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/prs?lang=${lang}`)
      .then(r => r.ok ? r.json() : [])
      .then((rows: PRRow[]) => {
        // Keep best per exercise+type
        const best: Record<string, PRRow> = {}
        for (const row of rows) {
          const key = `${row.exerciseId}::${row.type}`
          if (!best[key] || row.value > best[key].value) best[key] = row
        }
        // Group by exercise
        setPrs(Object.values(best))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [lang])

  if (loading) return <div className="text-center py-12 text-t3 text-sm">{t(lang, 'common.loading')}</div>

  // Group by exerciseId
  const byExercise: Record<string, PRRow[]> = {}
  for (const pr of prs) {
    if (!byExercise[pr.exerciseId]) byExercise[pr.exerciseId] = []
    byExercise[pr.exerciseId].push(pr)
  }

  const exerciseIds = Object.keys(byExercise)

  if (!exerciseIds.length) return (
    <div className="text-center py-12 text-t3 space-y-2">
      <p className="text-4xl">🏆</p>
      <p className="text-sm">{lang === 'it' ? 'Nessun record ancora. Continua ad allenarti!' : 'No records yet. Keep training!'}</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {exerciseIds.map(exId => {
        const rows = byExercise[exId]
        const name = rows[0].exerciseName ?? exId.replace(/-/g, ' ')
        const weightPR = rows.find(r => r.type === 'weight')
        const e1rmPR = rows.find(r => r.type === 'estimated_1rm')
        return (
          <div key={exId} className="card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-warning shrink-0" />
              <p className="text-t1 font-semibold text-sm capitalize">{name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {weightPR && (
                <div className="bg-warning/10 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-t3 uppercase tracking-wide mb-0.5">Max weight</p>
                  <p className="text-lg font-bold text-warning leading-none">{weightPR.weightKg}<span className="text-xs font-normal"> kg</span></p>
                  <p className="text-[10px] text-t3 mt-0.5">{weightPR.reps} reps</p>
                </div>
              )}
              {e1rmPR && (
                <div className="bg-primary/10 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-t3 uppercase tracking-wide mb-0.5">Est. 1RM</p>
                  <p className="text-lg font-bold text-primary leading-none">{Math.round(e1rmPR.value)}<span className="text-xs font-normal"> kg</span></p>
                  <p className="text-[10px] text-t3 mt-0.5">Epley</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Body Tab ──────────────────────────────────────────────────────────────────
interface BodyMeasurement {
  id: string
  measuredAt: string
  weightKg: number | null
  bodyFatPct: number | null
  waistCm: number | null
  leftArmCm: number | null
  notes: string | null
}

function BodyTab({ lang, units, stats, onAddMeasure }: {
  lang: Locale
  units: string
  stats: Stats | null
  onAddMeasure: () => void
}) {
  const wUnit = units === 'imperial' ? 'lbs' : 'kg'
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/body-measurements')
      .then(r => r.ok ? r.json() : [])
      .then((d: BodyMeasurement[]) => { setMeasurements(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-t3 text-sm">{t(lang, 'common.loading')}</div>

  if (!measurements.length) return (
    <div className="text-center py-12 text-t3 space-y-3">
      <p className="text-4xl">📏</p>
      <p className="text-sm">{lang === 'it' ? 'Nessuna misurazione ancora.' : 'No measurements yet.'}</p>
      <button onClick={onAddMeasure} className="btn-primary mx-auto gap-2">
        <Plus size={14} />
        {t(lang, 'progress.addMeasurement')}
      </button>
    </div>
  )

  const chartData = measurements
    .filter(m => m.weightKg != null)
    .slice(0, 12)
    .reverse()
    .map(m => ({
      date: new Date(m.measuredAt).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short' }),
      weight: m.weightKg,
    }))

  const latest = measurements[0]

  return (
    <div className="space-y-4">
      {chartData.length > 1 && (
        <div className="card p-4 space-y-3">
          <p className="text-t2 text-sm font-semibold">{t(lang, 'progress.weight')} ({wUnit})</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#22c55e' }}
                formatter={(v: number) => [`${v} ${wUnit}`, t(lang, 'progress.weight')]}
              />
              <Line type="monotone" dataKey="weight" stroke="var(--success)" strokeWidth={2} dot={{ r: 3, fill: 'var(--success)' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {latest && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-t3 text-xs font-medium uppercase tracking-wider">{t(lang, 'progress.measurements')}</p>
            <p className="text-t3 text-[11px]">{fmtDate(latest.measuredAt, lang)}</p>
          </div>
          {([
            [t(lang, 'progress.weight'), latest.weightKg, wUnit],
            ['Body Fat', latest.bodyFatPct, '%'],
            [t(lang, 'progress.waist'), latest.waistCm, 'cm'],
            [t(lang, 'progress.arms'), latest.leftArmCm, 'cm'],
          ] as [string, number | null, string][]).filter(([, v]) => v != null).map(([label, val, unit]) => (
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/[0.05] last:border-0">
              <span className="text-t2 text-sm">{label}</span>
              <span className="text-t1 font-semibold text-sm">{val} {unit}</span>
            </div>
          ))}
        </div>
      )}

      {measurements.length > 1 && (
        <div className="card p-4 space-y-2">
          <p className="text-t3 text-xs font-medium uppercase tracking-wider">{lang === 'it' ? 'Storico misurazioni' : 'Measurement history'}</p>
          {measurements.slice(0, 10).map(m => (
            <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.05] last:border-0">
              <p className="text-t2 text-xs">{fmtDate(m.measuredAt, lang)}</p>
              <div className="flex gap-3">
                {m.weightKg != null && <span className="text-t1 text-xs font-semibold">{m.weightKg} {wUnit}</span>}
                {m.bodyFatPct != null && <span className="text-t3 text-xs">{m.bodyFatPct}%</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddMeasurementSheet({ lang, units, onClose, onSaved }: { lang: Locale; units: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const u = units === 'imperial' ? 'lbs' : 'kg'

  const fields: [string, string, string][] = [
    ['weightKg', t(lang, 'progress.weight'), u],
    ['chestCm', t(lang, 'progress.chest'), 'cm'],
    ['waistCm', t(lang, 'progress.waist'), 'cm'],
    ['leftArmCm', t(lang, 'progress.arms'), 'cm'],
    ['leftThighCm', t(lang, 'progress.thighs'), 'cm'],
    ['leftCalfCm', t(lang, 'progress.calves'), 'cm'],
    ['bodyFatPct', t(lang, 'progress.bodyFat'), '%'],
  ]

  async function handleSave() {
    const body: Record<string, number> = {}
    for (const [k] of fields) {
      if (form[k]) body[k] = parseFloat(form[k])
    }
    if (!Object.keys(body).length) return
    setSaving(true)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, measuredAt: Date.now() }),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1 overlay" />
      <div className="bg-[#111118] border-t border-white/10 rounded-t-3xl p-6 pb-10 space-y-4 max-h-[80dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center -mt-2 mb-1"><div className="w-10 h-1 bg-white/20 rounded-full" /></div>
        <div className="flex items-center justify-between">
          <h2 className="text-t1 font-bold">{t(lang, 'progress.addMeasurement')}</h2>
          <button onClick={onClose} className="text-t3"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {fields.map(([key, label, unit]) => (
            <div key={key}>
              <label className="text-t3 text-xs mb-1 block">{label} ({unit})</label>
              <input
                type="number"
                className="input h-11 text-sm"
                placeholder="0"
                value={form[key] ?? ''}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                inputMode="decimal"
              />
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? t(lang, 'common.loading') : t(lang, 'common.save')}
        </button>
      </div>
    </div>
  )
}
