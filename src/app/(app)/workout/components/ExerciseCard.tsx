'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCcw } from 'lucide-react'
import { useWorkout, type ActiveExercise } from '@/stores/workout'
import { t, type Locale } from '@/i18n'
import { SetRow } from './SetRow'
import { AddExerciseSheet } from './AddExerciseSheet'

interface Props {
  exercise: ActiveExercise
  lang: Locale
  units: 'metric' | 'imperial'
}

export function ExerciseCard({ exercise, lang, units }: Props) {
  const { removeExercise, replaceExercise, addSet, updateSet, completeSet, removeSet } = useWorkout()
  const weightLabel = units === 'imperial' ? 'lbs' : 'kg'
  const [prWeightKg, setPrWeightKg] = useState(0)
  const [showReplace, setShowReplace] = useState(false)

  useEffect(() => {
    fetch(`/api/prs?exerciseId=${exercise.exerciseId}`)
      .then(r => r.ok ? r.json() : [])
      .then((prs: { type: string; weightKg: number | null; value: number }[]) => {
        const w = prs.find(p => p.type === 'weight')
        if (w) setPrWeightKg(w.weightKg ?? w.value)
      })
      .catch(() => {})
  }, [exercise.exerciseId])

  function handleCompleteSet(setId: string) {
    const s = exercise.sets.find(s => s.id === setId)
    if (s && prWeightKg > 0 && (s.weightKg ?? 0) > prWeightKg) {
      updateSet(exercise.id, setId, { isPr: true })
    }
    completeSet(exercise.id, setId)
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-t1 font-semibold flex-1 mr-2 text-base leading-snug">
          {exercise.exerciseName}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowReplace(true)}
            className="w-8 h-8 flex items-center justify-center text-t3 hover:text-accent transition-colors"
            aria-label={t(lang, 'exercises.replace')}
          >
            <RefreshCcw size={14} />
          </button>
          <button
            onClick={() => removeExercise(exercise.id)}
            className="w-8 h-8 flex items-center justify-center text-t3 hover:text-danger transition-colors"
            aria-label="Remove exercise"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {showReplace && (
          <AddExerciseSheet
            onClose={() => setShowReplace(false)}
            onAdd={(exId, name) => { replaceExercise(exercise.id, exId, name); setShowReplace(false) }}
          />
        )}
      </div>

      {/* Column headers */}
      <div className="set-row px-4 pb-1">
        <div className="text-t3 text-[11px] text-center font-medium uppercase tracking-wider">
          {t(lang, 'workout.set')}
        </div>
        <div className="text-t3 text-[11px] text-center font-medium uppercase tracking-wider">
          {weightLabel}
        </div>
        <div className="text-t3 text-[11px] text-center font-medium uppercase tracking-wider">
          {t(lang, 'common.reps')}
        </div>
        <div className="text-t3 text-[11px] text-center font-medium uppercase tracking-wider">
          {t(lang, 'workout.rpe')}
        </div>
        <div />
      </div>

      {/* Set rows */}
      <div className="px-4 space-y-0.5">
        {exercise.sets.map((set, i) => (
          <SetRow
            key={set.id}
            wexId={exercise.id}
            set={set}
            index={i}
            lang={lang}
            units={units}
            prWeightKg={prWeightKg}
            onComplete={() => handleCompleteSet(set.id)}
            onRemove={() => removeSet(exercise.id, set.id)}
          />
        ))}
      </div>

      {/* Add set */}
      <div className="px-4 py-3 border-t border-white/[0.05] mt-2">
        <button
          onClick={() => addSet(exercise.id)}
          className="btn-ghost w-full h-9 text-sm gap-1.5"
        >
          <Plus size={14} />
          {t(lang, 'workout.set')}
        </button>
      </div>
    </div>
  )
}
