import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { workouts, bodyMeasurements } from '@/lib/db/schema'
import { eq, desc, gte, sql } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const allWorkouts = db.select({
    id: workouts.id,
    startedAt: workouts.startedAt,
    totalVolumeKg: workouts.totalVolumeKg,
    totalSets: workouts.totalSets,
    durationSec: workouts.durationSec,
  })
    .from(workouts)
    .where(eq(workouts.userId, uid))
    .orderBy(desc(workouts.startedAt))
    .all()

  // Streak calculation (consecutive days)
  const daySet = new Set(allWorkouts.map(w => new Date(w.startedAt!).toDateString()))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (daySet.has(d.toDateString())) streak++
    else if (i > 0) break
  }

  // Weekly volume (last 7 days)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weeklyVol = allWorkouts
    .filter(w => new Date(w.startedAt!).getTime() > weekAgo)
    .reduce((a, w) => a + (w.totalVolumeKg ?? 0), 0)

  // Last 12 weeks volume per week
  const volumeByWeek: { week: string; volumeKg: number; count: number }[] = []
  for (let w = 11; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - (w + 1) * 7)
    const end = new Date(); end.setDate(end.getDate() - w * 7)
    const label = `W${12 - w}`
    const wWorkouts = allWorkouts.filter(wo => {
      const t = new Date(wo.startedAt!).getTime()
      return t >= start.getTime() && t < end.getTime()
    })
    volumeByWeek.push({
      week: label,
      volumeKg: Math.round(wWorkouts.reduce((a, wo) => a + (wo.totalVolumeKg ?? 0), 0)),
      count: wWorkouts.length,
    })
  }

  // Latest measurements
  const latestMeasurement = db.select().from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, uid))
    .orderBy(desc(bodyMeasurements.measuredAt))
    .get()

  return NextResponse.json({
    totalWorkouts: allWorkouts.length,
    streak,
    weeklyVolumeKg: Math.round(weeklyVol),
    avgDurationSec: allWorkouts.length
      ? Math.round(allWorkouts.reduce((a, w) => a + (w.durationSec ?? 0), 0) / allWorkouts.length)
      : 0,
    volumeByWeek,
    latestMeasurement,
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = generateId()
  db.insert(bodyMeasurements).values({
    id,
    userId: session.user.id,
    measuredAt: new Date(body.measuredAt ?? Date.now()),
    weightKg: body.weightKg ?? null,
    bodyFatPct: body.bodyFatPct ?? null,
    chestCm: body.chestCm ?? null,
    waistCm: body.waistCm ?? null,
    hipsCm: body.hipsCm ?? null,
    leftArmCm: body.leftArmCm ?? null,
    rightArmCm: body.rightArmCm ?? null,
    leftThighCm: body.leftThighCm ?? null,
    notes: body.notes ?? null,
  }).run()

  return NextResponse.json({ id })
}
