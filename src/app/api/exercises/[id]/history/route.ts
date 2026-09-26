import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workouts, workoutExercises, sets } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: exerciseId } = await context.params
  const uid = session.user.id

  // Get the last 5 workouts where this exercise was performed
  const wexRows = db.select({
    wexId: workoutExercises.id,
    workoutId: workoutExercises.workoutId,
    workoutName: workouts.name,
    startedAt: workouts.startedAt,
    durationSec: workouts.durationSec,
  })
    .from(workoutExercises)
    .innerJoin(workouts, and(
      eq(workoutExercises.workoutId, workouts.id),
      eq(workouts.userId, uid),
    ))
    .where(eq(workoutExercises.exerciseId, exerciseId))
    .orderBy(desc(workouts.startedAt))
    .limit(5)
    .all()

  const result = wexRows.map(row => {
    const completedSets = db.select()
      .from(sets)
      .where(and(eq(sets.workoutExId, row.wexId), eq(sets.isCompleted, true)))
      .orderBy(sets.setOrder)
      .all()

    const totalVol = completedSets.reduce((a, s) => a + (s.weightKg ?? 0) * (s.reps ?? 0), 0)
    const bestSet = completedSets.reduce((best, s) =>
      (s.weightKg ?? 0) > (best?.weightKg ?? 0) ? s : best
    , completedSets[0] ?? null)

    return {
      workoutId: row.workoutId,
      workoutName: row.workoutName,
      startedAt: row.startedAt,
      durationSec: row.durationSec,
      sets: completedSets.length,
      totalVolumeKg: Math.round(totalVol),
      bestWeightKg: bestSet?.weightKg ?? 0,
      bestReps: bestSet?.reps ?? 0,
    }
  })

  return NextResponse.json(result)
}
