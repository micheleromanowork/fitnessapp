'use client'
import { useState, useEffect } from 'react'
import { Search, X, Dumbbell } from 'lucide-react'
import { useWorkout } from '@/stores/workout'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

interface ExerciseItem {
  id: string
  name: string
  primaryMuscles: string[]
  difficulty: string
}

interface Props {
  onClose: () => void
  onAdd?: (exerciseId: string, name: string) => void  // if provided, skips workout store
}

export function AddExerciseSheet({ onClose, onAdd }: Props) {
  const lang = useProfile(s => s.language)
  const { addExercise } = useWorkout()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ExerciseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    const params = new URLSearchParams({ lang, limit: '50' })
    if (query.trim()) params.set('q', query.trim())
    fetch(`/api/exercises?${params}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => { setItems(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
    return () => ctrl.abort()
  }, [query, lang])

  function handlePick(ex: ExerciseItem) {
    if (onAdd) onAdd(ex.id, ex.name)
    else addExercise(ex.id, ex.name)
    onClose()
  }

  const diffClass = (d: string) =>
    d === 'beginner' ? 'badge-success' :
    d === 'intermediate' ? 'badge-warning' : 'badge-danger'

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1 overlay" />
      <div
        className="bg-[#111118] border-t border-white/10 rounded-t-3xl flex flex-col"
        style={{ maxHeight: '82dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 pointer-events-none" />
            <input
              autoFocus
              type="text"
              className="input pl-9 h-11 text-sm"
              placeholder={t(lang, 'exercises.search')}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button onClick={onClose} className="text-t3 hover:text-t1 transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-4 pb-10 space-y-2">
          {loading && (
            <div className="text-center py-10 text-t3 text-sm">{t(lang, 'common.loading')}</div>
          )}
          {!loading && items.length === 0 && (
            <div className="text-center py-10 text-t3 text-sm">{t(lang, 'exercises.noResults')}</div>
          )}
          {!loading && items.map(ex => (
            <button
              key={ex.id}
              onClick={() => handlePick(ex)}
              className="w-full card-2 p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Dumbbell size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-t1 text-sm font-medium truncate">{ex.name}</p>
                {ex.primaryMuscles.length > 0 && (
                  <p className="text-t3 text-xs truncate">{ex.primaryMuscles.join(', ')}</p>
                )}
              </div>
              <span className={`badge ${diffClass(ex.difficulty)} text-[10px] flex-shrink-0`}>
                {ex.difficulty}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
