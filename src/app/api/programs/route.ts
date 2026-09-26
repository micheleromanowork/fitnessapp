import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workoutPrograms, programDays, templateExercises } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const programs = await db
    .select()
    .from(workoutPrograms)
    .where(eq(workoutPrograms.userId, session.user.id))
    .orderBy(desc(workoutPrograms.createdAt))

  return NextResponse.json(programs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, goal, level, daysPerWeek, days, isAiGenerated } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const programId = generateId()

  await db.insert(workoutPrograms).values({
    id: programId,
    userId: session.user.id,
    name: name.trim(),
    description: description ?? null,
    goal: goal ?? null,
    level: level ?? null,
    daysPerWeek: daysPerWeek ?? null,
    isAiGenerated: isAiGenerated ?? false,
  })

  if (Array.isArray(days)) {
    for (let di = 0; di < days.length; di++) {
      const day = days[di]
      const dayId = generateId()
      await db.insert(programDays).values({
        id: dayId,
        programId,
        name: day.name,
        dayOrder: di,
        targetMuscles: day.targetMuscles ? JSON.stringify(day.targetMuscles) : null,
        durationMin: day.durationMin ?? null,
      })

      if (Array.isArray(day.exercises)) {
        for (let ei = 0; ei < day.exercises.length; ei++) {
          const ex = day.exercises[ei]
          await db.insert(templateExercises).values({
            id: generateId(),
            programDayId: dayId,
            exerciseId: ex.exerciseId,
            exerciseOrder: ei,
            setsTarget: ex.sets ?? 3,
            repsMin: ex.repsMin ?? null,
            repsMax: ex.repsMax ?? null,
            rpe: ex.rpe ?? null,
            restSec: ex.restSec ?? null,
            notes: ex.notes ?? null,
          })
        }
      }
    }
  }

  return NextResponse.json({ id: programId })
}
