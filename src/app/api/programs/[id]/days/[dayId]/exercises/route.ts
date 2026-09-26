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

  const [program] = await db.select().from(workoutPrograms)
    .where(and(eq(workoutPrograms.id, programId), eq(workoutPrograms.userId, session.user.id)))
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [day] = await db.select().from(programDays)
    .where(and(eq(programDays.id, dayId), eq(programDays.programId, programId)))
  if (!day) return NextResponse.json({ error: 'Day not found' }, { status: 404 })

  const body = await req.json()
  const existing = await db.select().from(templateExercises)
    .where(eq(templateExercises.programDayId, dayId))

  const texId = generateId()
  await db.insert(templateExercises).values({
    id: texId,
    programDayId: dayId,
    exerciseId: body.exerciseId,
    exerciseOrder: existing.length,
    setsTarget: body.sets ?? 3,
    repsMin: body.repsMin ?? 8,
    repsMax: body.repsMax ?? 12,
    restSec: body.restSec ?? 90,
  })

  return NextResponse.json({ id: texId })
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; dayId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: programId } = await context.params

  const [program] = await db.select().from(workoutPrograms)
    .where(and(eq(workoutPrograms.id, programId), eq(workoutPrograms.userId, session.user.id)))
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { texId } = await req.json()
  await db.delete(templateExercises).where(eq(templateExercises.id, texId))
  return NextResponse.json({ ok: true })
}
