import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workouts, workoutExercises, sets, exercises } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const since = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)

  const rows = await db.select({
    weightKg: sets.weightKg,
    reps: sets.reps,
    primaryMuscles: exercises.primaryMuscles,
  })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExId, workoutExercises.id))
    .innerJoin(workouts, and(
      eq(workoutExercises.workoutId, workouts.id),
      eq(workouts.userId, uid),
      gte(workouts.startedAt, since),
    ))
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(sets.isCompleted, true))

  const volumeByMuscle: Record<string, number> = {}

  for (const row of rows) {
    const vol = (row.weightKg ?? 0) * (row.reps ?? 0)
    let muscles: string[] = []
    try { muscles = JSON.parse(row.primaryMuscles ?? '[]') } catch { muscles = [] }
    for (const m of muscles) {
      volumeByMuscle[m] = (volumeByMuscle[m] ?? 0) + vol
    }
  }

  const result = Object.entries(volumeByMuscle)
    .map(([muscle, volumeKg]) => ({ muscle, volumeKg: Math.round(volumeKg) }))
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .slice(0, 10)

  return NextResponse.json(result)
}
