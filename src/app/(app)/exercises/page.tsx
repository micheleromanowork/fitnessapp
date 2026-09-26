'use client'

import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

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

export default function ExercisesPage() {
  const lang = useProfile(s => s.language)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = `/api/exercises?lang=${lang}&limit=50${query ? `&q=${encodeURIComponent(query)}` : ''}`
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(d => { setExercises(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [lang, query])

  const difficultyColor: Record<string, string> = {
    beginner: 'badge-success',
    intermediate: 'badge-warning',
    advanced: 'badge-danger',
  }

  return (
    <div className="min-h-screen px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold text-t1">{t(lang, 'exercises.title')}</h1>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 pointer-events-none" />
        <input
          type="search"
          placeholder={t(lang, 'exercises.search')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center text-t3 py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          {t(lang, 'common.loading')}
        </div>
      ) : exercises.length === 0 ? (
        <p className="text-center text-t3 py-12">{t(lang, 'exercises.noResults')}</p>
      ) : (
        <div className="space-y-2">
          {exercises.map(ex => (
            <div key={ex.id} className="card-2 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-t1 font-semibold text-sm leading-tight">{ex.name}</h3>
                <span className={`${difficultyColor[ex.difficulty] ?? 'badge-neutral'} shrink-0 text-[11px]`}>
                  {t(lang, `levels.${ex.difficulty}`)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ex.primaryMuscles.slice(0, 3).map(m => (
                  <span key={m} className="badge-primary text-[10px]">{m.replace('_', ' ')}</span>
                ))}
                <span className="badge-neutral text-[10px]">{ex.equipmentId?.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
