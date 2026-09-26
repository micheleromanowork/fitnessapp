import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workouts, workoutExercises, sets } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = db.select().from(workouts)
    .where(eq(workouts.userId, session.user.id))
    .orderBy(desc(workouts.startedAt))
    .limit(50)
    .all()

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, startedAt, exercises: exs, programId, programDayId } = body

  const completedAt = Date.now()
  const durationSec = Math.floor((completedAt - startedAt) / 1000)

  let totalVolumeKg = 0
  let totalSets = 0

  const workoutId = generateId()
  db.insert(workouts).values({
    id: workoutId,
    userId: session.user.id,
    name,
    startedAt: new Date(startedAt),
    completedAt: new Date(completedAt),
    durationSec,
    programId: programId ?? null,
    programDayId: programDayId ?? null,
    isCompleted: true,
  }).run()

  for (const ex of exs ?? []) {
    const wexId = generateId()
    db.insert(workoutExercises).values({
      id: wexId,
      workoutId,
      exerciseId: ex.exerciseId,
      exerciseOrder: ex.order ?? 0,
    }).run()

    for (const s of ex.sets ?? []) {
      if (!s.isCompleted) continue
      const vol = (s.weightKg ?? 0) * (s.reps ?? 0)
      totalVolumeKg += vol
      totalSets++

      db.insert(sets).values({
        id: generateId(),
        workoutExId: wexId,
        setOrder: s.order ?? 0,
        setType: s.type ?? 'normal',
        weightKg: s.weightKg ?? 0,
        reps: s.reps ?? 0,
        rpe: s.rpe ?? null,
        rir: s.rir ?? null,
        isCompleted: true,
        completedAt: new Date(s.completedAt ?? completedAt),
      }).run()
    }
  }

  db.update(workouts).set({ totalVolumeKg, totalSets }).where(eq(workouts.id, workoutId)).run()

  return NextResponse.json({ id: workoutId })
}
