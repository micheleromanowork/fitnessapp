'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { Plus, Trash2, Dumbbell, ChevronLeft, Zap } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { useWorkout } from '@/stores/workout'
import { t } from '@/i18n'
import { useRouter } from 'next/navigation'
import { AddExerciseSheet } from '@/app/(app)/workout/components/AddExerciseSheet'

interface TemplateEx {
  id: string
  exerciseId: string
  exerciseOrder: number
  setsTarget: number | null
  repsMin: number | null
  repsMax: number | null
  restSec: number | null
  nameEn: string | null
  nameIt: string | null
}
interface ProgramDay {
  id: string
  name: string
  dayOrder: number
  exercises: TemplateEx[]
}
interface ProgramDetail {
  id: string
  name: string
  description: string | null
  goal: string | null
  level: string | null
  daysPerWeek: number | null
  isActive: boolean
  days: ProgramDay[]
}

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const lang = useProfile(s => s.language)
  const router = useRouter()
  const { startWorkout, addExerciseFromTemplate } = useWorkout()
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [addExToDay, setAddExToDay] = useState<string | null>(null) // dayId

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch(`/api/programs/${id}`)
    if (r.ok) setProgram(await r.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleAddDay() {
    const name = prompt(t(lang, 'programs.addDay'))
    if (!name) return
    await fetch(`/api/programs/${id}/days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    load()
  }

  async function handleRemoveEx(dayId: string, texId: string) {
    await fetch(`/api/programs/${id}/days/${dayId}/exercises`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texId }),
    })
    load()
  }

  function handleStartDay(day: ProgramDay) {
    startWorkout(day.name, id, day.id)
    for (const ex of day.exercises) {
      const name = lang === 'it' ? ex.nameIt ?? ex.nameEn ?? '' : ex.nameEn ?? ex.nameIt ?? ''
      addExerciseFromTemplate(ex.exerciseId, name, ex.setsTarget, ex.repsMin, ex.restSec)
    }
    router.push('/workout')
  }

  // When the add-exercise sheet picks an exercise for a day
  async function handleAddExToDay(exerciseId: string, name: string) {
    if (!addExToDay) return
    await fetch(`/api/programs/${id}/days/${addExToDay}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId }),
    })
    setAddExToDay(null)
    load()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-t3">{t(lang, 'common.loading')}</div>
  }
  if (!program) {
    return <div className="min-h-screen flex items-center justify-center text-t3">Not found</div>
  }

  return (
    <>
      <div className="pb-nav">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-t3 hover:text-t1 transition-colors">
              <ChevronLeft size={22} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-t1 font-bold text-base truncate">{program.name}</h1>
              {(program.goal || program.daysPerWeek) && (
                <p className="text-t3 text-xs">
                  {program.daysPerWeek && `${program.daysPerWeek}×/w`}
                  {program.goal && ` · ${t(lang, `goals.${program.goal}`)}`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {program.days.length === 0 && (
            <div className="text-center py-12 text-t3 text-sm space-y-2">
              <Dumbbell size={32} className="opacity-30 mx-auto" />
              <p>{t(lang, 'programs.addDay')}</p>
            </div>
          )}

          {program.days.map(day => (
            <div key={day.id} className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className="text-t1 font-semibold text-sm">{day.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddExToDay(day.id)}
                    className="text-t3 hover:text-primary transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  {day.exercises.length > 0 && (
                    <button
                      onClick={() => handleStartDay(day)}
                      className="btn-primary h-7 px-3 text-xs gap-1"
                    >
                      <Zap size={12} />
                      {t(lang, 'workout.start')}
                    </button>
                  )}
                </div>
              </div>

              {day.exercises.length === 0 ? (
                <div className="px-4 pb-4 text-t3 text-xs">{t(lang, 'workout.addExercise')}</div>
              ) : (
                <div className="px-4 pb-3 space-y-2">
                  {day.exercises.map(ex => {
                    const name = lang === 'it' ? ex.nameIt ?? ex.nameEn : ex.nameEn ?? ex.nameIt
                    return (
                      <div key={ex.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                        <div>
                          <p className="text-t2 text-sm">{name}</p>
                          <p className="text-t3 text-xs">
                            {ex.setsTarget}×{ex.repsMin}–{ex.repsMax}
                          </p>
                        </div>
                        <button onClick={() => handleRemoveEx(day.id, ex.id)} className="text-t3 hover:text-danger transition-colors p-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          <button onClick={handleAddDay} className="btn-secondary w-full gap-2">
            <Plus size={16} />
            {t(lang, 'programs.addDay')}
          </button>
        </div>
      </div>

      {addExToDay && (
        <AddExerciseSheet
          onClose={() => setAddExToDay(null)}
          onAdd={(exId, name) => handleAddExToDay(exId, name)}
        />
      )}
    </>
  )
}
