'use client'

import { useState, useEffect } from 'react'
import { Plus, Dumbbell, StickyNote, Calculator } from 'lucide-react'
import { useWorkout, type ActiveWorkout } from '@/stores/workout'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'
import { RestTimerOverlay } from './components/RestTimerOverlay'
import { ExerciseCard } from './components/ExerciseCard'
import { AddExerciseSheet } from './components/AddExerciseSheet'
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal'
import { PlateCalculator } from './components/PlateCalculator'

function fmtElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function WorkoutClient() {
  const lang = useProfile(s => s.language)
  const units = useProfile(s => s.units)
  const defaultRestSec = useProfile(s => s.defaultRestSec)
  const autoStartTimer = useProfile(s => s.autoStartTimer)
  const { active, startWorkout, finishWorkout, discardWorkout, updateNotes, timerRunning, tickTimer, syncFromProfile } = useWorkout()

  const [elapsed, setElapsed] = useState(0)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showPlates, setShowPlates] = useState(false)
  const [finishedWorkout, setFinishedWorkout] = useState<ActiveWorkout | null>(null)

  useEffect(() => { syncFromProfile(defaultRestSec, autoStartTimer) }, [defaultRestSec, autoStartTimer, syncFromProfile])

  // Elapsed display ticker
  useEffect(() => {
    if (!active?.startedAt) return
    const start = active.startedAt
    setElapsed(Date.now() - start)
    const id = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => clearInterval(id)
  }, [active?.startedAt])

  // Rest timer ticker
  useEffect(() => {
    if (!timerRunning) return
    const id = setInterval(() => tickTimer(), 1000)
    return () => clearInterval(id)
  }, [timerRunning, tickTimer])

  function handleQuickStart() {
    startWorkout(lang === 'it' ? 'Allenamento libero' : 'Quick Workout')
  }

  function handleFinish() {
    const w = finishWorkout()
    if (w) setFinishedWorkout(w)
  }

  function handleDiscard() {
    if (confirm(t(lang, 'workout.confirmDiscard'))) {
      discardWorkout()
    }
  }

  // No active workout — start screen
  if (!active) {
    return (
      <div className="min-h-screen px-4 py-6">
        <h1 className="text-2xl font-bold text-t1 mb-6">{t(lang, 'nav.workout')}</h1>
        <div className="space-y-4">
          <button onClick={handleQuickStart} className="btn-primary w-full text-base gap-2">
            <Plus size={20} />
            {t(lang, 'home.quickStart')}
          </button>
          <p className="text-t3 text-center text-sm">{t(lang, 'workout.noWorkouts')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="pb-nav">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-t1 font-bold text-base leading-tight truncate">{active.name}</h1>
              <p className="timer-font text-primary text-sm font-semibold">{fmtElapsed(elapsed)}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowPlates(true)}
                className="btn-ghost h-9 px-3 text-sm"
                aria-label="Plate calculator"
              >
                <Calculator size={16} />
              </button>
              <button
                onClick={() => setShowNotes(v => !v)}
                className={`btn-ghost h-9 px-3 text-sm ${active.notes ? 'text-accent' : ''}`}
                aria-label="Notes"
              >
                <StickyNote size={16} />
              </button>
              <button
                onClick={handleDiscard}
                className="btn-ghost h-9 px-3 text-sm text-danger"
              >
                {t(lang, 'workout.discard')}
              </button>
              <button
                onClick={handleFinish}
                className="btn-success h-9 px-4 text-sm"
              >
                {t(lang, 'workout.finish')}
              </button>
            </div>
          </div>
        </div>

        {/* Workout notes */}
        {showNotes && (
          <div className="px-4 pt-3 pb-1">
            <textarea
              autoFocus
              className="input text-sm resize-none h-20"
              placeholder={lang === 'it' ? 'Note allenamento…' : 'Workout notes…'}
              value={active.notes ?? ''}
              onChange={e => updateNotes(e.target.value)}
            />
          </div>
        )}

        {/* Exercise list */}
        <div className="px-4 py-4 space-y-4">
          {active.exercises.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-14 text-t3">
              <Dumbbell size={36} className="opacity-30" />
              <p className="text-sm">{t(lang, 'workout.addExercise')}</p>
            </div>
          )}

          {active.exercises.map(ex => (
            <ExerciseCard key={ex.id} exercise={ex} lang={lang} units={units} />
          ))}

          <button
            onClick={() => setShowAddExercise(true)}
            className="btn-secondary w-full gap-2"
          >
            <Plus size={18} />
            {t(lang, 'workout.addExercise')}
          </button>
        </div>
      </div>

      <RestTimerOverlay />

      {showAddExercise && (
        <AddExerciseSheet onClose={() => setShowAddExercise(false)} />
      )}

      {showPlates && (
        <PlateCalculator onClose={() => setShowPlates(false)} lang={lang} units={units} />
      )}

      {finishedWorkout && (
        <WorkoutSummaryModal
          workout={finishedWorkout}
          lang={lang}
          units={units}
          onSave={async () => {
            if (finishedWorkout) {
              await fetch('/api/workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: finishedWorkout.name,
                  startedAt: finishedWorkout.startedAt,
                  programId: finishedWorkout.programId,
                  programDayId: finishedWorkout.programDayId,
                  exercises: finishedWorkout.exercises.map(e => ({
                    exerciseId: e.exerciseId,
                    order: e.order,
                    sets: e.sets,
                  })),
                }),
              }).catch(console.error)
            }
            setFinishedWorkout(null)
          }}
          onDiscard={() => setFinishedWorkout(null)}
        />
      )}
    </>
  )
}
