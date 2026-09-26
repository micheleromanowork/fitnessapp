'use client'
import { Check } from 'lucide-react'
import type { ActiveSet, SetType } from '@/stores/workout'
import { useWorkout } from '@/stores/workout'
import type { Locale } from '@/i18n'

const SET_LABEL: Record<SetType, string> = {
  normal: '',
  warmup: 'W',
  drop_set: 'D',
  failure: 'F',
  amrap: 'A',
  rest_pause: 'R',
}

interface Props {
  wexId: string
  set: ActiveSet
  index: number
  lang: Locale
  units: 'metric' | 'imperial'
  prWeightKg: number
  onComplete: () => void
  onRemove: () => void
}

export function SetRow({ wexId, set, index, lang, units, prWeightKg, onComplete, onRemove }: Props) {
  const { updateSet } = useWorkout()
  const label = set.type === 'normal' ? String(index + 1) : SET_LABEL[set.type]
  const willBePR = !set.isCompleted && prWeightKg > 0 && (set.weightKg ?? 0) > prWeightKg

  return (
    <div className={`set-row py-1.5 transition-opacity ${set.isCompleted ? 'opacity-50' : ''}`}>
      {/* Set label / PR indicator */}
      <div className={`text-center text-sm font-bold rounded-lg py-1 ${
        set.isPr ? 'text-warning' :
        set.type === 'warmup' ? 'text-warning' :
        set.type === 'drop_set' ? 'text-accent' :
        'text-t3'
      }`}>
        {set.isPr ? '🏆' : (label || String(index + 1))}
      </div>

      {/* Weight */}
      <input
        type="number"
        className={`num-input w-full ${willBePR ? 'text-warning' : ''}`}
        value={set.weightKg || ''}
        placeholder="0"
        onChange={e => updateSet(wexId, set.id, { weightKg: parseFloat(e.target.value) || 0 })}
        disabled={set.isCompleted}
        inputMode="decimal"
        min="0"
        step="0.5"
      />

      {/* Reps */}
      <input
        type="number"
        className="num-input w-full"
        value={set.reps || ''}
        placeholder="0"
        onChange={e => updateSet(wexId, set.id, { reps: parseInt(e.target.value) || 0 })}
        disabled={set.isCompleted}
        inputMode="numeric"
        min="0"
      />

      {/* RPE */}
      <input
        type="number"
        className="num-input w-full text-t3"
        value={set.rpe ?? ''}
        placeholder="—"
        onChange={e => {
          const v = parseInt(e.target.value)
          updateSet(wexId, set.id, { rpe: v >= 1 && v <= 10 ? v : undefined })
        }}
        disabled={set.isCompleted}
        inputMode="numeric"
        min="1"
        max="10"
      />

      {/* Complete / remove */}
      <button
        onClick={() => set.isCompleted ? onRemove() : onComplete()}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          set.isCompleted
            ? 'bg-success/20 text-success active:bg-danger/20 active:text-danger'
            : willBePR
            ? 'bg-warning/20 text-warning hover:bg-warning/30'
            : 'bg-white/[0.05] text-t3 active:bg-success/20 active:text-success hover:bg-success/20 hover:text-success'
        }`}
      >
        <Check size={16} />
      </button>
    </div>
  )
}
