import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workoutPrograms, programDays, templateExercises, exercises } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params

  const [program] = await db.select().from(workoutPrograms)
    .where(and(eq(workoutPrograms.id, id), eq(workoutPrograms.userId, session.user.id)))
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const days = await db.select().from(programDays)
    .where(eq(programDays.programId, id))
    .orderBy(programDays.dayOrder)

  const daysWithExercises = await Promise.all(days.map(async day => {
    const texs = await db.select({
      id: templateExercises.id,
      exerciseId: templateExercises.exerciseId,
      exerciseOrder: templateExercises.exerciseOrder,
      setsTarget: templateExercises.setsTarget,
      repsMin: templateExercises.repsMin,
      repsMax: templateExercises.repsMax,
      rpe: templateExercises.rpe,
      restSec: templateExercises.restSec,
      notes: templateExercises.notes,
      nameEn: exercises.nameEn,
      nameIt: exercises.nameIt,
    })
      .from(templateExercises)
      .leftJoin(exercises, eq(templateExercises.exerciseId, exercises.id))
      .where(eq(templateExercises.programDayId, day.id))
      .orderBy(templateExercises.exerciseOrder)
    return { ...day, exercises: texs }
  }))

  return NextResponse.json({ ...program, days: daysWithExercises })
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params

  const [existing] = await db.select().from(workoutPrograms)
    .where(and(eq(workoutPrograms.id, id), eq(workoutPrograms.userId, session.user.id)))
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const patch: Record<string, unknown> = { updatedAt: Date.now() }
  if (body.name !== undefined) patch.name = body.name
  if (body.description !== undefined) patch.description = body.description
  if (body.isActive !== undefined) patch.isActive = body.isActive
  if (body.isArchived !== undefined) patch.isArchived = body.isArchived

  await db.update(workoutPrograms).set(patch).where(eq(workoutPrograms.id, id))
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params

  await db.delete(workoutPrograms)
    .where(and(eq(workoutPrograms.id, id), eq(workoutPrograms.userId, session.user.id)))
  return NextResponse.json({ ok: true })
}
