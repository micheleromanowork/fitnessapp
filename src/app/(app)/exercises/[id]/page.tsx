'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Dumbbell, Target, Lightbulb, AlertTriangle, Plus, Trophy, History, Wind } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { useWorkout } from '@/stores/workout'
import { t, type Locale } from '@/i18n'

interface ExerciseDetail {
  id: string
  slug: string
  name: string
  nameEn: string
  nameIt: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  equipmentId: string
  difficulty: string
  movementType: string
  instructions: string[]
  mistakes: string[]
  tips: string[]
  breathing?: string
  alternatives: string[]
  tags: string[]
}

interface PR {
  type: string
  value: number
  weightKg: number | null
  reps: number | null
  achievedAt: string
}

interface HistoryEntry {
  workoutId: string
  workoutName: string
  startedAt: string
  sets: number
  totalVolumeKg: number
  bestWeightKg: number
  bestReps: number
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'badge-success',
  intermediate: 'badge-warning',
  advanced: 'badge-danger',
}

function MuscleBadge({ name }: { name: string }) {
  return (
    <span className="badge-primary text-[11px] capitalize">{name.replace(/-/g, ' ')}</span>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-t1 font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function ExerciseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lang = useProfile(s => s.language) as Locale
  const active = useWorkout(s => s.active)
  const addExercise = useWorkout(s => s.addExercise)

  const [exercise, setExercise] = useState<ExerciseDetail | null>(null)
  const [prs, setPrs] = useState<PR[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  const id = params.id as string

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [exRes, prRes, histRes] = await Promise.all([
        fetch(`/api/exercises/${id}?lang=${lang}`),
        fetch(`/api/prs?exerciseId=${id}&lang=${lang}`),
        fetch(`/api/exercises/${id}/history`),
      ])
      if (exRes.ok) setExercise(await exRes.json())
      if (prRes.ok) {
        const all: PR[] = await prRes.json()
        const best: Record<string, PR> = {}
        for (const pr of all) {
          if (!best[pr.type] || pr.value > best[pr.type].value) best[pr.type] = pr
        }
        setPrs(Object.values(best))
      }
      if (histRes.ok) setHistory(await histRes.json())
    } finally {
      setLoading(false)
    }
  }, [id, lang])

  useEffect(() => { load() }, [load])

  function handleAddToWorkout() {
    if (!exercise) return
    addExercise(exercise.id, exercise.name)
    setAdded(true)
    setTimeout(() => router.push('/workout'), 800)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!exercise) return (
    <div className="min-h-screen flex items-center justify-center text-t3">
      {t(lang, 'exercises.noResults')}
    </div>
  )

  const weightPR = prs.find(p => p.type === 'weight')
  const e1rmPR = prs.find(p => p.type === 'estimated_1rm')

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-ghost p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-t1 font-bold flex-1 text-base leading-tight truncate">{exercise.name}</h1>
        <span className={`${DIFFICULTY_COLOR[exercise.difficulty] ?? 'badge-neutral'} text-[11px] shrink-0`}>
          {t(lang, `levels.${exercise.difficulty}`)}
        </span>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Meta tags */}
        <div className="flex flex-wrap gap-2">
          <span className="badge-neutral text-[11px] capitalize">{exercise.equipmentId?.replace(/-/g, ' ')}</span>
          <span className="badge-neutral text-[11px] capitalize">{exercise.movementType}</span>
          {exercise.tags.slice(0, 4).map(tag => (
            <span key={tag} className="badge-neutral text-[10px] opacity-70">{tag}</span>
          ))}
        </div>

        {/* Muscles */}
        <div className="card p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-primary" />
            <span className="text-t1 font-semibold text-sm">{t(lang, 'exercises.primaryMuscles')}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exercise.primaryMuscles.map(m => <MuscleBadge key={m} name={m} />)}
          </div>
          {exercise.secondaryMuscles.length > 0 && (
            <>
              <p className="text-t3 text-xs pt-1">{t(lang, 'exercises.secondaryMuscles')}</p>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map(m => (
                  <span key={m} className="badge-neutral text-[11px] capitalize">{m.replace(/-/g, ' ')}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Personal records */}
        {(weightPR || e1rmPR) && (
          <Section title="Personal Records" icon={<Trophy size={16} className="text-warning" />}>
            <div className="grid grid-cols-2 gap-3">
              {weightPR && (
                <div className="bg-warning/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-t3 uppercase tracking-wide mb-1">Max Weight</p>
                  <p className="text-xl font-bold text-warning">{weightPR.weightKg}<span className="text-sm font-normal"> kg</span></p>
                  <p className="text-[10px] text-t3">{weightPR.reps} reps</p>
                </div>
              )}
              {e1rmPR && (
                <div className="bg-primary/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-t3 uppercase tracking-wide mb-1">Est. 1RM</p>
                  <p className="text-xl font-bold text-primary">{e1rmPR.value}<span className="text-sm font-normal"> kg</span></p>
                  <p className="text-[10px] text-t3">Epley formula</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Instructions */}
        {exercise.instructions.length > 0 && (
          <Section title={t(lang, 'exercises.instructions')} icon={<Dumbbell size={16} className="text-primary" />}>
            <ol className="space-y-2">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-t2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Tips */}
        {exercise.tips.length > 0 && (
          <Section title={t(lang, 'exercises.tips')} icon={<Lightbulb size={16} className="text-accent" />}>
            <ul className="space-y-2">
              {exercise.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-t2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Breathing */}
        {exercise.breathing && (
          <Section title={t(lang, 'exercises.breathing')} icon={<Wind size={16} className="text-success" />}>
            <p className="text-t2 text-sm leading-relaxed">{exercise.breathing}</p>
          </Section>
        )}

        {/* Mistakes */}
        {exercise.mistakes.length > 0 && (
          <Section title={t(lang, 'exercises.mistakes')} icon={<AlertTriangle size={16} className="text-danger" />}>
            <ul className="space-y-2">
              {exercise.mistakes.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm text-t2">
                  <span className="text-danger mt-0.5">✗</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Exercise history */}
        {history.length > 0 && (
          <Section title={t(lang, 'exercises.history')} icon={<History size={16} className="text-accent" />}>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.05] last:border-0">
                  <div>
                    <p className="text-t2 text-xs">
                      {new Date(h.startedAt).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-t3 text-[11px]">{h.sets} sets · {h.totalVolumeKg} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-t1 text-sm font-semibold">{h.bestWeightKg} kg</p>
                    <p className="text-t3 text-[11px]">× {h.bestReps}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Alternatives */}
        {exercise.alternatives.length > 0 && (
          <div className="card p-4 space-y-2">
            <p className="text-t3 text-xs font-medium uppercase tracking-wider">{t(lang, 'exercises.alternatives')}</p>
            <div className="flex flex-wrap gap-2">
              {exercise.alternatives.map(alt => (
                <button
                  key={alt}
                  onClick={() => router.push(`/exercises/${alt}`)}
                  className="badge-neutral text-[11px] cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {alt.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add to workout FAB */}
      {active && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-20">
          <button
            onClick={handleAddToWorkout}
            disabled={added}
            className={`btn-primary gap-2 shadow-lg shadow-primary/30 ${added ? 'opacity-70' : ''}`}
          >
            {added ? (
              <span>✓ {t(lang, 'exercises.addToWorkout')}</span>
            ) : (
              <>
                <Plus size={18} />
                {t(lang, 'exercises.addToWorkout')}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
