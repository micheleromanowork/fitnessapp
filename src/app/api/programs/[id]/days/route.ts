import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workoutPrograms, programDays } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: programId } = await context.params

  const [program] = await db.select().from(workoutPrograms)
    .where(and(eq(workoutPrograms.id, programId), eq(workoutPrograms.userId, session.user.id)))
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const existing = await db.select().from(programDays).where(eq(programDays.programId, programId))

  const dayId = generateId()
  await db.insert(programDays).values({
    id: dayId,
    programId,
    name: body.name ?? `Day ${existing.length + 1}`,
    dayOrder: existing.length,
    targetMuscles: body.targetMuscles ? JSON.stringify(body.targetMuscles) : null,
  })

  return NextResponse.json({ id: dayId })
}
