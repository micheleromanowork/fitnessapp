'use client'
import { CheckCircle, Clock, Dumbbell, TrendingUp, X, Trophy } from 'lucide-react'
import type { ActiveWorkout } from '@/stores/workout'
import { t, type Locale } from '@/i18n'

interface Props {
  workout: ActiveWorkout
  lang: Locale
  units: 'metric' | 'imperial'
  onSave: () => void
  onDiscard: () => void
}

function fmtDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function WorkoutSummaryModal({ workout, lang, units, onSave, onDiscard }: Props) {
  const completedSets = workout.exercises.flatMap(e => e.sets.filter(s => s.isCompleted))
  const totalSets = completedSets.length
  const totalVol = completedSets.reduce((a, s) => a + s.weightKg * s.reps, 0)
  const duration = Date.now() - workout.startedAt
  const wUnit = units === 'imperial' ? 'lbs' : 'kg'

  // Collect new PRs from the workout
  const newPRs = workout.exercises
    .map(ex => {
      const prSet = ex.sets.find(s => s.isPr && s.isCompleted)
      if (!prSet) return null
      return { name: ex.exerciseName, weightKg: prSet.weightKg, reps: prSet.reps }
    })
    .filter(Boolean) as { name: string; weightKg: number; reps: number }[]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overlay">
      <div className="w-full max-w-sm bg-[#111118] border border-white/10 rounded-t-3xl p-6 pb-10 space-y-5 max-h-[90dvh] overflow-y-auto">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-success/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-success" />
          </div>
          <div>
            <h2 className="text-t1 font-bold">{workout.name}</h2>
            <p className="text-t3 text-xs">{t(lang, 'workout.summary')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-2 p-3 text-center space-y-1.5">
            <Clock size={16} className="text-primary mx-auto" />
            <p className="text-t1 font-bold text-lg leading-none">{fmtDuration(duration)}</p>
            <p className="text-t3 text-[11px]">{t(lang, 'workout.elapsed')}</p>
          </div>
          <div className="card-2 p-3 text-center space-y-1.5">
            <Dumbbell size={16} className="text-accent mx-auto" />
            <p className="text-t1 font-bold text-lg leading-none">{totalSets}</p>
            <p className="text-t3 text-[11px]">{t(lang, 'workout.sets')}</p>
          </div>
          <div className="card-2 p-3 text-center space-y-1.5">
            <TrendingUp size={16} className="text-success mx-auto" />
            <p className="text-t1 font-bold text-lg leading-none">{Math.round(totalVol)}</p>
            <p className="text-t3 text-[11px]">{wUnit}</p>
          </div>
        </div>

        {/* New PRs celebration */}
        {newPRs.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-warning" />
              <p className="text-warning text-sm font-bold">
                {lang === 'it' ? `${newPRs.length} nuovo/i record!` : `${newPRs.length} new PR${newPRs.length > 1 ? 's' : ''}!`}
              </p>
            </div>
            {newPRs.map((pr, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-t2 text-sm truncate max-w-[60%]">{pr.name}</span>
                <span className="text-warning font-semibold text-sm">{pr.weightKg}kg × {pr.reps}</span>
              </div>
            ))}
          </div>
        )}

        {/* Exercise breakdown */}
        {workout.exercises.length > 0 && (
          <div className="space-y-2">
            {workout.exercises.map(ex => {
              const done = ex.sets.filter(s => s.isCompleted)
              if (!done.length) return null
              const lastW = done[done.length - 1]?.weightKg ?? 0
              const hasPr = done.some(s => s.isPr)
              return (
                <div key={ex.id} className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                  <div className="flex items-center gap-1.5">
                    {hasPr && <Trophy size={12} className="text-warning flex-shrink-0" />}
                    <p className="text-t2 text-sm font-medium">{ex.exerciseName}</p>
                  </div>
                  <p className="text-t3 text-xs">
                    {done.length} {t(lang, 'workout.sets').toLowerCase()} · {lastW} {wUnit}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onDiscard} className="btn-ghost flex-1 gap-2">
            <X size={16} />
            {t(lang, 'workout.discard')}
          </button>
          <button onClick={onSave} className="btn-success flex-1 gap-2">
            <CheckCircle size={16} />
            {t(lang, 'workout.finish')}
          </button>
        </div>
      </div>
    </div>
  )
}
