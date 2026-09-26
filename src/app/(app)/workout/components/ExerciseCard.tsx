'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCcw, Timer, Link2, Link2Off } from 'lucide-react'
import { useWorkout, type ActiveExercise } from '@/stores/workout'
import { t, type Locale } from '@/i18n'
import { SetRow } from './SetRow'
import { AddExerciseSheet } from './AddExerciseSheet'

interface Props {
  exercise: ActiveExercise
  lang: Locale
  units: 'metric' | 'imperial'
  isLast?: boolean
  nextExercise?: ActiveExercise
}

export function ExerciseCard({ exercise, lang, units, isLast, nextExercise }: Props) {
  const { removeExercise, replaceExercise, setExerciseRest, addSet, updateSet, completeSet, removeSet, toggleSuperset } = useWorkout()
  const inSuperset = !!exercise.supersetGroupId
  const supersetWithNext = inSuperset && nextExercise?.supersetGroupId === exercise.supersetGroupId
  const weightLabel = units === 'imperial' ? 'lbs' : 'kg'
  const [prWeightKg, setPrWeightKg] = useState(0)
  const [showReplace, setShowReplace] = useState(false)
  const [showRestPicker, setShowRestPicker] = useState(false)
  const REST_OPTIONS = [30, 60, 90, 120, 180, 240]

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
    <div className={`card overflow-hidden ${inSuperset ? 'border border-accent/30' : ''}`}>
      {/* Superset label */}
      {inSuperset && (
        <div className="px-4 pt-2 pb-0">
          <span className="text-accent text-[10px] font-bold uppercase tracking-widest">Superset</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-t1 font-semibold flex-1 mr-2 text-base leading-snug">
          {exercise.exerciseName}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isLast && (
            <button
              onClick={() => toggleSuperset(exercise.id)}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${supersetWithNext ? 'text-accent' : 'text-t3 hover:text-accent'}`}
              aria-label="Superset"
            >
              {supersetWithNext ? <Link2Off size={13} /> : <Link2 size={13} />}
            </button>
          )}
          <button
            onClick={() => setShowRestPicker(v => !v)}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${exercise.restSec ? 'text-accent' : 'text-t3 hover:text-accent'}`}
            aria-label="Rest timer"
          >
            <Timer size={14} />
          </button>
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

      {/* Rest time picker */}
      {showRestPicker && (
        <div className="px-4 pb-2 flex items-center gap-2 flex-wrap">
          <span className="text-t3 text-xs">{lang === 'it' ? 'Riposo:' : 'Rest:'}</span>
          {REST_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setExerciseRest(exercise.id, s); setShowRestPicker(false) }}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                exercise.restSec === s ? 'bg-accent text-white' : 'bg-[#1a1a24] text-t2 hover:bg-[#222230]'
              }`}
            >
              {s < 60 ? `${s}s` : s === 60 ? '1m' : s === 90 ? '1:30' : `${s / 60}m`}
            </button>
          ))}
        </div>
      )}

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
