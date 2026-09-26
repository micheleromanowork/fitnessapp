'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/stores/profile'
import { t, type Locale } from '@/i18n'

type Exercise = {
  id: string
  slug: string
  name: string
  difficulty: string
  movementType: string
  equipmentId: string
  primaryMuscles: string[]
  tags: string[]
}

const MUSCLE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'lats', label: 'Lats' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'quads', label: 'Quads' },
  { key: 'hamstrings', label: 'Hamstrings' },
  { key: 'glutes', label: 'Glutes' },
  { key: 'abs', label: 'Abs' },
  { key: 'obliques', label: 'Obliques' },
  { key: 'calves', label: 'Calves' },
  { key: 'forearms', label: 'Forearms' },
]

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'badge-success',
  intermediate: 'badge-warning',
  advanced: 'badge-danger',
}

export default function ExercisesPage() {
  const lang = useProfile(s => s.language) as Locale
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ lang, limit: '40' })
    if (query) params.set('q', query)
    if (muscle) params.set('muscle', muscle)
    try {
      const r = await fetch(`/api/exercises?${params}`)
      const d = await r.json()
      setExercises(d.data ?? [])
      setTotal(d.meta?.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [lang, query, muscle])

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky header + search */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-white/[0.06] px-4 pt-6 pb-3 space-y-3">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold text-t1">{t(lang, 'exercises.title')}</h1>
          {total > 0 && <span className="text-t3 text-xs">{total}</span>}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 pointer-events-none" />
          <input
            type="search"
            placeholder={t(lang, 'exercises.search')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input pl-9 h-9 text-sm"
          />
        </div>

        {/* Muscle filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
          {MUSCLE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setMuscle(f.key)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                muscle === f.key
                  ? 'bg-primary text-white'
                  : 'bg-white/[0.06] text-t3 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : exercises.length === 0 ? (
          <p className="text-center text-t3 py-12">{t(lang, 'exercises.noResults')}</p>
        ) : (
          <div className="space-y-2">
            {exercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => router.push(`/exercises/${ex.slug}`)}
                className="card-2 w-full p-4 text-left space-y-2 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-t1 font-semibold text-sm leading-tight">{ex.name}</h3>
                  <span className={`${DIFFICULTY_COLOR[ex.difficulty] ?? 'badge-neutral'} shrink-0 text-[10px]`}>
                    {t(lang, `levels.${ex.difficulty}`)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.primaryMuscles.slice(0, 3).map(m => (
                    <span key={m} className="badge-primary text-[10px] capitalize">{m.replace(/-/g, ' ')}</span>
                  ))}
                  <span className="badge-neutral text-[10px] capitalize">{ex.equipmentId?.replace(/-/g, ' ')}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
