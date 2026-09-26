'use client'

import { Plus, Dumbbell } from 'lucide-react'
import { useWorkout } from '@/stores/workout'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

export function WorkoutClient() {
  const lang = useProfile(s => s.language)
  const { active, startWorkout } = useWorkout()

  function handleQuickStart() {
    startWorkout(lang === 'it' ? 'Allenamento libero' : 'Quick Workout')
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold text-t1 mb-6">{t(lang, 'nav.workout')}</h1>

      {!active ? (
        <div className="space-y-4">
          <button
            onClick={handleQuickStart}
            className="btn-primary w-full text-base gap-2"
          >
            <Plus size={20} />
            {t(lang, 'home.quickStart')}
          </button>
          <p className="text-t3 text-center text-sm">{t(lang, 'workout.noWorkouts')}</p>
        </div>
      ) : (
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Dumbbell size={24} className="text-primary" />
            <div>
              <h2 className="text-t1 font-semibold">{active.name}</h2>
              <p className="text-t3 text-xs">{t(lang, 'workout.active')}</p>
            </div>
          </div>
          <p className="text-t2 text-sm">
            {t(lang, 'workout.sets')}: {active.exercises.reduce((a, e) => a + e.sets.length, 0)}
          </p>
          {/* Full workout tracker — Milestone 4 */}
          <div className="text-center py-8 text-t3 text-sm border border-dashed border-white/10 rounded-xl">
            Workout tracker — Milestone 4
          </div>
        </div>
      )}
    </div>
  )
}
