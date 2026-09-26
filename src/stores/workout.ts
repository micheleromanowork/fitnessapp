'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateId } from '@/lib/utils'

export type SetType = 'normal' | 'warmup' | 'drop_set' | 'failure' | 'amrap' | 'rest_pause'

export interface ActiveSet {
  id: string
  order: number
  type: SetType
  weightKg: number
  reps: number
  rpe?: number
  rir?: number
  isCompleted: boolean
  isPr?: boolean
  notes?: string
  completedAt?: number
}

export interface ActiveExercise {
  id: string
  exerciseId: string
  exerciseName: string
  order: number
  supersetGroupId?: string
  supersetOrder?: number
  sets: ActiveSet[]
  restSec?: number
  notes?: string
}

export interface ActiveWorkout {
  id: string
  name: string
  programId?: string
  programDayId?: string
  startedAt: number
  exercises: ActiveExercise[]
  notes?: string
}

interface WorkoutStore {
  active: ActiveWorkout | null
  timerSec: number
  timerRunning: boolean
  timerVisible: boolean
  lastRestSec: number
  autoStartTimer: boolean

  startWorkout(name: string, programId?: string, programDayId?: string): string
  finishWorkout(): ActiveWorkout | null
  discardWorkout(): void
  updateNotes(notes: string): void
  syncFromProfile(defaultRestSec: number, autoStartTimer: boolean): void

  addExercise(exerciseId: string, name: string): void
  addExerciseFromTemplate(exerciseId: string, name: string, setsTarget: number | null, repsTarget: number | null, restSec: number | null): void
  removeExercise(wexId: string): void
  replaceExercise(wexId: string, newExerciseId: string, newName: string): void
  setExerciseRest(wexId: string, restSec: number): void

  addSet(wexId: string, type?: SetType): void
  updateSet(wexId: string, setId: string, patch: Partial<ActiveSet>): void
  completeSet(wexId: string, setId: string): void
  removeSet(wexId: string, setId: string): void
  duplicateLastSet(wexId: string): void

  toggleSuperset(wexId: string): void

  startTimer(sec: number): void
  pauseTimer(): void
  skipTimer(): void
  tickTimer(): void
}

export const useWorkout = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      active: null,
      timerSec: 0,
      timerRunning: false,
      timerVisible: false,
      lastRestSec: 90,
      autoStartTimer: true,

      startWorkout: (name, programId, programDayId) => {
        const id = generateId()
        set({ active: { id, name, programId, programDayId, startedAt: Date.now(), exercises: [] } })
        return id
      },

      finishWorkout: () => {
        const w = get().active
        set({ active: null, timerRunning: false, timerVisible: false })
        return w
      },

      discardWorkout: () => set({ active: null, timerRunning: false, timerVisible: false }),

      updateNotes: (notes) => set(s => s.active ? { active: { ...s.active, notes } } : s),

      syncFromProfile: (defaultRestSec, autoStartTimer) =>
        set({ lastRestSec: defaultRestSec, autoStartTimer }),

      addExerciseFromTemplate: (exerciseId, name, setsTarget, repsTarget, restSec) =>
        set(s => {
          if (!s.active) return s
          const n = setsTarget ?? 3
          const reps = repsTarget ?? 0
          const templateSets: ActiveSet[] = Array.from({ length: n }, (_, i) => ({
            id: generateId(), order: i, type: 'normal' as SetType, weightKg: 0, reps, isCompleted: false,
          }))
          const ex: ActiveExercise = {
            id: generateId(), exerciseId, exerciseName: name,
            order: s.active.exercises.length,
            sets: templateSets,
            restSec: restSec ?? undefined,
          }
          return { active: { ...s.active, exercises: [...s.active.exercises, ex] } }
        }),

      addExercise: (exerciseId, name) =>
        set(s => {
          if (!s.active) return s
          const ex: ActiveExercise = {
            id: generateId(), exerciseId, exerciseName: name,
            order: s.active.exercises.length,
            sets: [{ id: generateId(), order: 0, type: 'normal', weightKg: 0, reps: 0, isCompleted: false }],
          }
          return { active: { ...s.active, exercises: [...s.active.exercises, ex] } }
        }),

      removeExercise: (wexId) =>
        set(s => s.active
          ? { active: { ...s.active, exercises: s.active.exercises.filter(e => e.id !== wexId) } }
          : s),

      replaceExercise: (wexId, newExerciseId, newName) =>
        set(s => s.active
          ? { active: { ...s.active, exercises: s.active.exercises.map(e =>
              e.id !== wexId ? e : { ...e, exerciseId: newExerciseId, exerciseName: newName }
            )}}
          : s),

      setExerciseRest: (wexId, restSec) =>
        set(s => s.active
          ? { active: { ...s.active, exercises: s.active.exercises.map(e =>
              e.id !== wexId ? e : { ...e, restSec }
            )}}
          : s),

      addSet: (wexId, type = 'normal') =>
        set(s => {
          if (!s.active) return s
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map(e => {
                if (e.id !== wexId) return e
                const last = e.sets[e.sets.length - 1]
                return {
                  ...e,
                  sets: [...e.sets, {
                    id: generateId(), order: e.sets.length, type,
                    weightKg: last?.weightKg ?? 0, reps: last?.reps ?? 0, isCompleted: false,
                  }],
                }
              }),
            },
          }
        }),

      updateSet: (wexId, setId, patch) =>
        set(s => {
          if (!s.active) return s
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map(e =>
                e.id !== wexId ? e : { ...e, sets: e.sets.map(s => s.id !== setId ? s : { ...s, ...patch }) }
              ),
            },
          }
        }),

      completeSet: (wexId, setId) => {
        const { lastRestSec, autoStartTimer } = get()
        set(s => {
          if (!s.active) return s
          const ex = s.active.exercises.find(e => e.id === wexId)
          const restSec = ex?.restSec ?? lastRestSec
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map(e =>
                e.id !== wexId ? e : {
                  ...e,
                  sets: e.sets.map(s => s.id !== setId ? s : { ...s, isCompleted: true, completedAt: Date.now() }),
                }
              ),
            },
            ...(autoStartTimer ? { timerSec: restSec, timerRunning: true, timerVisible: true } : {}),
          }
        })
      },

      removeSet: (wexId, setId) =>
        set(s => {
          if (!s.active) return s
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map(e =>
                e.id !== wexId ? e : { ...e, sets: e.sets.filter(s => s.id !== setId).map((s, i) => ({ ...s, order: i })) }
              ),
            },
          }
        }),

      duplicateLastSet: (wexId) =>
        set(s => {
          if (!s.active) return s
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map(e => {
                if (e.id !== wexId) return e
                const last = e.sets[e.sets.length - 1]
                if (!last) return e
                return { ...e, sets: [...e.sets, { ...last, id: generateId(), order: e.sets.length, isCompleted: false, completedAt: undefined }] }
              }),
            },
          }
        }),

      toggleSuperset: (wexId) =>
        set(s => {
          if (!s.active) return s
          const exercises = s.active.exercises
          const idx = exercises.findIndex(e => e.id === wexId)
          if (idx < 0 || idx >= exercises.length - 1) return s
          const ex = exercises[idx]
          const next = exercises[idx + 1]

          if (ex.supersetGroupId && ex.supersetGroupId === next.supersetGroupId) {
            // Clear superset for both
            return {
              active: {
                ...s.active,
                exercises: exercises.map(e =>
                  e.id === wexId || e.id === next.id
                    ? { ...e, supersetGroupId: undefined, supersetOrder: undefined }
                    : e
                ),
              },
            }
          } else {
            // Group together
            const groupId = ex.supersetGroupId ?? generateId()
            return {
              active: {
                ...s.active,
                exercises: exercises.map(e =>
                  e.id === wexId
                    ? { ...e, supersetGroupId: groupId, supersetOrder: 0 }
                    : e.id === next.id
                    ? { ...e, supersetGroupId: groupId, supersetOrder: 1 }
                    : e
                ),
              },
            }
          }
        }),

      startTimer: (sec) => set({ timerSec: sec, timerRunning: true, timerVisible: true, lastRestSec: sec }),
      pauseTimer: () => set(s => ({ timerRunning: !s.timerRunning })),
      skipTimer: () => set({ timerSec: 0, timerRunning: false, timerVisible: false }),
      tickTimer: () =>
        set(s => s.timerSec <= 1
          ? { timerSec: 0, timerRunning: false, timerVisible: false }
          : { timerSec: s.timerSec - 1 }
        ),
    }),
    {
      name: 'fitos-workout',
      storage: createJSONStorage(() => localStorage),
      partialize: s => ({ active: s.active, lastRestSec: s.lastRestSec, autoStartTimer: s.autoStartTimer }),
    }
  )
)
