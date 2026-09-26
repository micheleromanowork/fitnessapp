import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workouts, workoutExercises, sets, personalRecords } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
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

  // Auto-detect personal records
  const uid = session.user.id
  const now = new Date(completedAt)
  for (const ex of exs ?? []) {
    const completedSets = (ex.sets ?? []).filter((s: { isCompleted?: boolean; weightKg?: number; reps?: number }) => s.isCompleted)
    if (!completedSets.length) continue

    // Best weight set
    const bestWeight = completedSets.reduce((best: { weightKg?: number; reps?: number }, s: { weightKg?: number; reps?: number }) =>
      (s.weightKg ?? 0) > (best.weightKg ?? 0) ? s : best, completedSets[0])
    if ((bestWeight.weightKg ?? 0) > 0) {
      const existing = db.select({ value: personalRecords.value }).from(personalRecords)
        .where(and(eq(personalRecords.userId, uid), eq(personalRecords.exerciseId, ex.exerciseId), eq(personalRecords.type, 'weight')))
        .orderBy(desc(personalRecords.value))
        .get()
      if (!existing || (bestWeight.weightKg ?? 0) > existing.value) {
        db.insert(personalRecords).values({
          id: generateId(), userId: uid, exerciseId: ex.exerciseId,
          type: 'weight', value: bestWeight.weightKg ?? 0,
          weightKg: bestWeight.weightKg ?? 0, reps: bestWeight.reps ?? 0,
          workoutId, achievedAt: now,
        }).run()
      }
    }

    // Best estimated 1RM (Epley formula)
    const best1rm = completedSets.reduce((best: { weightKg?: number; reps?: number }, s: { weightKg?: number; reps?: number }) => {
      const e1rm = (w: number, r: number) => r <= 1 ? w : w * (1 + r / 30)
      return e1rm(s.weightKg ?? 0, s.reps ?? 0) > e1rm(best.weightKg ?? 0, best.reps ?? 0) ? s : best
    }, completedSets[0])
    const new1rm = (best1rm.weightKg ?? 0) * (1 + (best1rm.reps ?? 0) / 30)
    if (new1rm > 0 && (best1rm.reps ?? 0) > 1) {
      const existing1rm = db.select({ value: personalRecords.value }).from(personalRecords)
        .where(and(eq(personalRecords.userId, uid), eq(personalRecords.exerciseId, ex.exerciseId), eq(personalRecords.type, 'estimated_1rm')))
        .orderBy(desc(personalRecords.value))
        .get()
      if (!existing1rm || new1rm > existing1rm.value) {
        db.insert(personalRecords).values({
          id: generateId(), userId: uid, exerciseId: ex.exerciseId,
          type: 'estimated_1rm', value: Math.round(new1rm * 10) / 10,
          weightKg: best1rm.weightKg ?? 0, reps: best1rm.reps ?? 0,
          workoutId, achievedAt: now,
        }).run()
      }
    }
  }

  return NextResponse.json({ id: workoutId })
}
