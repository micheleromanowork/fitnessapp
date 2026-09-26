'use client'

import { useState, useEffect } from 'react'
import { Flame, TrendingUp, Dumbbell, Clock, Plus, X } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { t, type Locale } from '@/i18n'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
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

function fmtDur(sec: number) {
  const m = Math.floor(sec / 60)
  return m > 0 ? `${m}m` : `${sec}s`
}

export default function ProgressPage() {
  const lang = useProfile(s => s.language)
  const units = useProfile(s => s.units)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'stats' | 'body'>('stats')
  const [showAddMeasure, setShowAddMeasure] = useState(false)

  async function load() {
    setLoading(true)
    const r = await fetch('/api/progress')
    if (r.ok) setStats(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const wUnit = units === 'imperial' ? 'lbs' : 'kg'

  return (
    <div className="min-h-screen px-4 py-6 pb-nav">
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
      <div className="flex gap-2 mb-5">
        {(['stats', 'body'] as const).map(tab_ => (
          <button
            key={tab_}
            onClick={() => setTab(tab_)}
            className={`flex-1 h-9 rounded-xl text-sm font-semibold transition-colors ${
              tab === tab_ ? 'bg-primary text-white' : 'bg-[#1a1a24] text-t2'
            }`}
          >
            {tab_ === 'stats' ? t(lang, 'analytics.title') : t(lang, 'progress.measurements')}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-16 text-t3 text-sm">{t(lang, 'common.loading')}</div>}

      {!loading && stats && tab === 'stats' && (
        <div className="space-y-5">
          {/* KPI row */}
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

          {/* Volume chart */}
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

          {/* Workout count chart */}
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

      {!loading && stats && tab === 'body' && (
        <div className="space-y-4">
          {!stats.latestMeasurement ? (
            <div className="text-center py-12 text-t3 text-sm space-y-3">
              <p className="text-4xl">📏</p>
              <p>{t(lang, 'progress.addMeasurement')}</p>
              <button onClick={() => setShowAddMeasure(true)} className="btn-secondary gap-2 mx-auto text-sm">
                <Plus size={14} />
                {t(lang, 'progress.addMeasurement')}
              </button>
            </div>
          ) : (
            <MeasurementCard m={stats.latestMeasurement} lang={lang} units={units} />
          )}
        </div>
      )}

      {showAddMeasure && (
        <AddMeasurementSheet lang={lang} units={units} onClose={() => setShowAddMeasure(false)} onSaved={() => { setShowAddMeasure(false); load() }} />
      )}
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
    for (const [k, , ] of fields) {
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
