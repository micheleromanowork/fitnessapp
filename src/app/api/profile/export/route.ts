import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workouts, workoutExercises, sets, exercises, personalRecords, bodyMeasurements } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const allWorkouts = db.select().from(workouts)
    .where(eq(workouts.userId, uid))
    .orderBy(desc(workouts.startedAt))
    .all()

  const workoutsWithDetail = allWorkouts.map(w => {
    const wexRows = db.select({
      wexId: workoutExercises.id,
      exerciseId: workoutExercises.exerciseId,
      exerciseOrder: workoutExercises.exerciseOrder,
      nameEn: exercises.nameEn,
      nameIt: exercises.nameIt,
    })
      .from(workoutExercises)
      .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, w.id))
      .all()

    const exercisesWithSets = wexRows.map(ex => ({
      exerciseId: ex.exerciseId,
      name: ex.nameEn,
      order: ex.exerciseOrder,
      sets: db.select().from(sets)
        .where(and(eq(sets.workoutExId, ex.wexId), eq(sets.isCompleted, true)))
        .all()
        .map(s => ({ setOrder: s.setOrder, weightKg: s.weightKg, reps: s.reps, setType: s.setType })),
    }))

    return { ...w, exercises: exercisesWithSets }
  })

  const prs = db.select({
    exerciseId: personalRecords.exerciseId,
    type: personalRecords.type,
    value: personalRecords.value,
    weightKg: personalRecords.weightKg,
    reps: personalRecords.reps,
    achievedAt: personalRecords.achievedAt,
    exerciseName: exercises.nameEn,
  })
    .from(personalRecords)
    .leftJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .where(eq(personalRecords.userId, uid))
    .all()

  const measurements = db.select().from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, uid))
    .orderBy(desc(bodyMeasurements.measuredAt))
    .all()

  const exportData = {
    exportedAt: new Date().toISOString(),
    workouts: workoutsWithDetail,
    personalRecords: prs,
    bodyMeasurements: measurements,
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="fitos-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
