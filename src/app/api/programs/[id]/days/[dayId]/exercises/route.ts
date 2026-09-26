import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workoutPrograms, programDays, templateExercises } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; dayId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: programId, dayId } = await context.params

  // Verify ownership
  const program = db.select().from(workoutPrograms)
    .where(and(eq(workoutPrograms.id, programId), eq(workoutPrograms.userId, session.user.id)))
    .get()
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const day = db.select().from(programDays)
    .where(and(eq(programDays.id, dayId), eq(programDays.programId, programId)))
    .get()
  if (!day) return NextResponse.json({ error: 'Day not found' }, { status: 404 })

  const body = await req.json()
  const existing = db.select().from(templateExercises)
    .where(eq(templateExercises.programDayId, dayId)).all()

  const texId = generateId()
  db.insert(templateExercises).values({
    id: texId,
    programDayId: dayId,
    exerciseId: body.exerciseId,
    exerciseOrder: existing.length,
    setsTarget: body.sets ?? 3,
    repsMin: body.repsMin ?? 8,
    repsMax: body.repsMax ?? 12,
    restSec: body.restSec ?? 90,
  }).run()

  return NextResponse.json({ id: texId })
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; dayId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: programId, dayId } = await context.params

  const program = db.select().from(workoutPrograms)
    .where(and(eq(workoutPrograms.id, programId), eq(workoutPrograms.userId, session.user.id)))
    .get()
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { texId } = await req.json()
  db.delete(templateExercises).where(eq(templateExercises.id, texId)).run()
  return NextResponse.json({ ok: true })
}
