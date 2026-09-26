import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workouts, workoutExercises, sets, exercises } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const lang = (req.nextUrl.searchParams.get('lang') ?? 'en') as 'en' | 'it'

  const workout = db.select().from(workouts)
    .where(and(eq(workouts.id, id), eq(workouts.userId, session.user.id)))
    .get()

  if (!workout) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const wexs = db.select({
    id: workoutExercises.id,
    exerciseId: workoutExercises.exerciseId,
    exerciseOrder: workoutExercises.exerciseOrder,
    nameEn: exercises.nameEn,
    nameIt: exercises.nameIt,
  })
    .from(workoutExercises)
    .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(workoutExercises.workoutId, id))
    .orderBy(asc(workoutExercises.exerciseOrder))
    .all()

  const exercisesWithSets = wexs.map(ex => {
    const exSets = db.select().from(sets)
      .where(eq(sets.workoutExId, ex.id))
      .orderBy(asc(sets.setOrder))
      .all()
    return {
      id: ex.id,
      exerciseId: ex.exerciseId,
      name: lang === 'it' ? ex.nameIt : ex.nameEn,
      order: ex.exerciseOrder,
      sets: exSets,
    }
  })

  return NextResponse.json({ ...workout, exercises: exercisesWithSets })
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params

  const workout = db.select({ id: workouts.id }).from(workouts)
    .where(and(eq(workouts.id, id), eq(workouts.userId, session.user.id)))
    .get()

  if (!workout) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  db.delete(workouts).where(eq(workouts.id, id)).run()
  return NextResponse.json({ ok: true })
}
