'use client'
import { Plus, Trash2 } from 'lucide-react'
import { useWorkout, type ActiveExercise } from '@/stores/workout'
import { t, type Locale } from '@/i18n'
import { SetRow } from './SetRow'

interface Props {
  exercise: ActiveExercise
  lang: Locale
  units: 'metric' | 'imperial'
}

export function ExerciseCard({ exercise, lang, units }: Props) {
  const { removeExercise, addSet } = useWorkout()
  const weightLabel = units === 'imperial' ? 'lbs' : 'kg'

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-t1 font-semibold flex-1 mr-2 text-base leading-snug">
          {exercise.exerciseName}
        </h3>
        <button
          onClick={() => removeExercise(exercise.id)}
          className="w-8 h-8 flex items-center justify-center text-t3 hover:text-danger transition-colors flex-shrink-0"
          aria-label="Remove exercise"
        >
          <Trash2 size={15} />
        </button>
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
