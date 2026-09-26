'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Sparkles, Zap, ChevronRight, CheckCircle2, Trash2 } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { t, type Locale } from '@/i18n'
import { useRouter } from 'next/navigation'

interface Program {
  id: string
  name: string
  description: string | null
  goal: string | null
  level: string | null
  daysPerWeek: number | null
  isActive: boolean
  isAiGenerated: boolean
  createdAt: number
}

export default function ProgramsPage() {
  const lang = useProfile(s => s.language)
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/programs')
    if (r.ok) setPrograms(await r.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleActivate(id: string, current: boolean) {
    await fetch(`/api/programs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm(t(lang, 'common.confirm') + '?')) return
    await fetch(`/api/programs/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="min-h-screen px-4 py-6 pb-nav">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-t1">{t(lang, 'programs.title')}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowGenerate(true)} className="btn-secondary h-9 px-3 gap-1.5 text-sm">
            <Sparkles size={15} className="text-accent" />
            AI
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary h-9 px-3 gap-1.5 text-sm">
            <Plus size={16} />
            {t(lang, 'common.add')}
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-16 text-t3 text-sm">{t(lang, 'common.loading')}</div>}

      {!loading && programs.length === 0 && (
        <div className="text-center py-16 text-t3 space-y-3">
          <p className="text-4xl">📋</p>
          <p className="text-sm">{t(lang, 'programs.empty')}</p>
          <button onClick={() => setShowGenerate(true)} className="btn-secondary gap-2 mx-auto text-sm">
            <Sparkles size={14} className="text-accent" />
            {t(lang, 'programs.aiGenerate')}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {programs.map(p => (
          <div key={p.id} className="card p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-t1 font-semibold">{p.name}</h3>
                  {p.isActive && (
                    <span className="badge badge-success text-[10px]">
                      {t(lang, 'programs.active')}
                    </span>
                  )}
                  {p.isAiGenerated && (
                    <span className="badge badge-accent text-[10px]">AI</span>
                  )}
                </div>
                {p.description && <p className="text-t3 text-xs mt-0.5 line-clamp-1">{p.description}</p>}
                <div className="flex gap-3 mt-1.5 text-t3 text-xs">
                  {p.daysPerWeek && <span>{p.daysPerWeek}×/w</span>}
                  {p.goal && <span>{t(lang, `goals.${p.goal}`)}</span>}
                  {p.level && <span>{t(lang, `levels.${p.level}`)}</span>}
                </div>
              </div>
              <button
                onClick={() => router.push(`/programs/${p.id}`)}
                className="text-t3 hover:text-t1 transition-colors flex-shrink-0"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleActivate(p.id, p.isActive)}
                className={`flex-1 h-9 text-xs gap-1.5 ${p.isActive ? 'btn-ghost text-success' : 'btn-secondary'}`}
              >
                <CheckCircle2 size={14} />
                {p.isActive ? t(lang, 'programs.active') : t(lang, 'workout.start')}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="btn-ghost h-9 px-3 text-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && <CreateProgramModal lang={lang} onClose={() => setShowCreate(false)} onSaved={load} />}
      {showGenerate && <GenerateProgramModal lang={lang} onClose={() => setShowGenerate(false)} onSaved={() => { setShowGenerate(false); load() }} />}
    </div>
  )
}

// ── Create Modal ──────────────────────────────────────────────────────────────
function CreateProgramModal({ lang, onClose, onSaved }: { lang: Locale; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('muscle_gain')
  const [level, setLevel] = useState('intermediate')
  const [days, setDays] = useState(3)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, goal, level, daysPerWeek: days }),
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} title={t(lang, 'programs.create')}>
      <div className="space-y-4">
        <div>
          <label className="text-t3 text-xs mb-1.5 block">{t(lang, 'common.edit')}</label>
          <input autoFocus className="input" placeholder={t(lang, 'programs.create')} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-t3 text-xs mb-1.5 block">{t(lang, 'onboarding.goal')}</label>
          <select className="input" value={goal} onChange={e => setGoal(e.target.value)}>
            {['muscle_gain','fat_loss','strength','general_fitness','endurance'].map(g => (
              <option key={g} value={g}>{t(lang, `goals.${g}`)}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-t3 text-xs mb-1.5 block">{t(lang, 'onboarding.level')}</label>
            <select className="input" value={level} onChange={e => setLevel(e.target.value)}>
              {['beginner','intermediate','advanced'].map(l => (
                <option key={l} value={l}>{t(lang, `levels.${l}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-t3 text-xs mb-1.5 block">{t(lang, 'onboarding.frequency')}</label>
            <select className="input" value={days} onChange={e => setDays(Number(e.target.value))}>
              {[3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || !name.trim()} className="btn-primary w-full">
          {saving ? t(lang, 'common.loading') : t(lang, 'common.save')}
        </button>
      </div>
    </BottomSheet>
  )
}

// ── AI Generate Modal ─────────────────────────────────────────────────────────
function GenerateProgramModal({ lang, onClose, onSaved }: { lang: Locale; onClose: () => void; onSaved: () => void }) {
  const [goal, setGoal] = useState('muscle_gain')
  const [level, setLevel] = useState('intermediate')
  const [days, setDays] = useState(3)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ name: string; description: string; days: { name: string; exercises: { exerciseId: string }[] }[] } | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setPreview(null)
    const r = await fetch('/api/programs/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, level, daysPerWeek: days, lang }),
    })
    const data = await r.json()
    setPreview(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!preview) return
    setSaving(true)
    await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...preview, goal, level, daysPerWeek: days, isAiGenerated: true }),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <BottomSheet onClose={onClose} title={t(lang, 'programs.aiGenerate')}>
      <div className="space-y-4">
        {!preview && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-t3 text-xs mb-1.5 block">{t(lang, 'onboarding.goal')}</label>
                <select className="input" value={goal} onChange={e => setGoal(e.target.value)}>
                  {['muscle_gain','fat_loss','strength','general_fitness','endurance'].map(g => (
                    <option key={g} value={g}>{t(lang, `goals.${g}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-t3 text-xs mb-1.5 block">{t(lang, 'onboarding.level')}</label>
                <select className="input" value={level} onChange={e => setLevel(e.target.value)}>
                  {['beginner','intermediate','advanced'].map(l => (
                    <option key={l} value={l}>{t(lang, `levels.${l}`)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-t3 text-xs mb-1.5 block">{t(lang, 'onboarding.frequency')}</label>
              <div className="flex gap-2">
                {[3,4,5,6].map(n => (
                  <button key={n} onClick={() => setDays(n)}
                    className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-colors ${days === n ? 'bg-primary text-white' : 'bg-[#1a1a24] text-t2'}`}>
                    {n}×
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full gap-2">
              {loading ? <><span className="animate-spin">⟳</span> {t(lang, 'common.loading')}</> : <><Sparkles size={16} /> {t(lang, 'programs.aiGenerate')}</>}
            </button>
          </>
        )}

        {preview && (
          <>
            <div className="card-2 p-3 space-y-1">
              <p className="text-t1 font-bold">{preview.name}</p>
              {preview.description && <p className="text-t3 text-xs">{preview.description}</p>}
              <p className="text-accent text-xs">{preview.days?.length} {t(lang, 'programs.addDay').toLowerCase?.() ?? 'days'}</p>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {preview.days?.map((day, i) => (
                <div key={i} className="text-xs">
                  <p className="text-t2 font-medium">{day.name}</p>
                  <p className="text-t3">{day.exercises?.length} {t(lang, 'exercises.title').toLowerCase()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreview(null)} className="btn-ghost flex-1 text-sm">{t(lang, 'common.back')}</button>
              <button onClick={handleSave} disabled={saving} className="btn-success flex-1 text-sm gap-1.5">
                <Zap size={14} /> {t(lang, 'common.save')}
              </button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}

// ── Shared bottom-sheet wrapper ───────────────────────────────────────────────
function BottomSheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1 overlay" />
      <div
        className="bg-[#111118] border-t border-white/10 rounded-t-3xl p-6 pb-10 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center -mt-2 mb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        <h2 className="text-t1 font-bold text-lg">{title}</h2>
        {children}
      </div>
    </div>
  )
}
