'use client'
import { useState } from 'react'
import { CheckCircle, Clock, Dumbbell, TrendingUp, X, Trophy, BookmarkPlus, ChevronRight } from 'lucide-react'
import type { ActiveWorkout } from '@/stores/workout'
import { t, type Locale } from '@/i18n'

interface Props {
  workout: ActiveWorkout
  lang: Locale
  units: 'metric' | 'imperial'
  onSave: () => void
  onDiscard: () => void
}

interface Program { id: string; name: string }

async function saveAsTemplate(workout: ActiveWorkout, programId: string, dayName: string) {
  const dayRes = await fetch(`/api/programs/${programId}/days`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: dayName }),
  })
  if (!dayRes.ok) throw new Error('Failed to create day')
  const { id: dayId } = await dayRes.json()

  for (const ex of workout.exercises) {
    const completed = ex.sets.filter(s => s.isCompleted)
    if (!completed.length) continue
    await fetch(`/api/programs/${programId}/days/${dayId}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseId: ex.exerciseId,
        sets: completed.length,
        restSec: ex.restSec ?? 90,
      }),
    })
  }
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

  const [showTemplate, setShowTemplate] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function openTemplateSheet() {
    const r = await fetch('/api/programs').catch(() => null)
    if (r?.ok) setPrograms(await r.json())
    setShowTemplate(true)
  }

  async function handleSaveTemplate(program: Program) {
    setSaving(true)
    try {
      await saveAsTemplate(workout, program.id, workout.name)
      setSaved(true)
      setShowTemplate(false)
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

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

        {/* Save as template */}
        <button
          onClick={saved ? undefined : openTemplateSheet}
          className={`w-full h-10 rounded-2xl border text-sm flex items-center justify-center gap-2 transition-colors ${
            saved
              ? 'border-success/30 text-success bg-success/10'
              : 'border-white/10 text-t3 hover:text-t1 hover:border-white/20'
          }`}
        >
          <BookmarkPlus size={15} />
          {saved
            ? (lang === 'it' ? 'Salvato nel programma!' : 'Saved to program!')
            : (lang === 'it' ? 'Salva come template' : 'Save as template')}
        </button>

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

      {/* Program picker sheet */}
      {showTemplate && (
        <div className="fixed inset-0 z-[60] flex flex-col" onClick={() => setShowTemplate(false)}>
          <div className="flex-1 overlay" />
          <div className="bg-[#111118] border-t border-white/10 rounded-t-3xl p-5 pb-10 max-h-[60dvh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex justify-center -mt-1 mb-4"><div className="w-10 h-1 bg-white/20 rounded-full" /></div>
            <h3 className="text-t1 font-bold mb-4">
              {lang === 'it' ? 'Salva in programma' : 'Save to program'}
            </h3>
            {programs.length === 0 ? (
              <p className="text-t3 text-sm text-center py-6">
                {lang === 'it' ? 'Nessun programma. Creane uno prima.' : 'No programs. Create one first.'}
              </p>
            ) : (
              <div className="space-y-2">
                {programs.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSaveTemplate(p)}
                    disabled={saving}
                    className="card-2 w-full p-4 text-left flex items-center justify-between hover:border-primary/40 transition-colors"
                  >
                    <span className="text-t1 text-sm font-medium">{p.name}</span>
                    <ChevronRight size={16} className="text-t3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
