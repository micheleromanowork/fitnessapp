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

  const wexRows = db.select({
    wexId: workoutExercises.id,
    startedAt: workouts.startedAt,
  })
    .from(workoutExercises)
    .innerJoin(workouts, and(
      eq(workoutExercises.workoutId, workouts.id),
      eq(workouts.userId, uid),
    ))
    .where(eq(workoutExercises.exerciseId, exerciseId))
    .orderBy(desc(workouts.startedAt))
    .limit(20)
    .all()

  const result = wexRows
    .map(row => {
      const completedSets = db.select()
        .from(sets)
        .where(and(eq(sets.workoutExId, row.wexId), eq(sets.isCompleted, true)))
        .all()

      const best = completedSets.reduce((max, s) => {
        if (!s.weightKg || !s.reps) return max
        const e1rm = s.weightKg * (1 + s.reps / 30)
        return e1rm > max ? e1rm : max
      }, 0)

      if (best === 0) return null
      return {
        date: new Date(row.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        e1rm: Math.round(best * 10) / 10,
        rawDate: row.startedAt,
      }
    })
    .filter(Boolean)
    .reverse()

  return NextResponse.json(result)
}
