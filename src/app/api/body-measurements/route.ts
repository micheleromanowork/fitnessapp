import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { bodyMeasurements } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select({
    id: bodyMeasurements.id,
    measuredAt: bodyMeasurements.measuredAt,
    weightKg: bodyMeasurements.weightKg,
    bodyFatPct: bodyMeasurements.bodyFatPct,
    waistCm: bodyMeasurements.waistCm,
    leftArmCm: bodyMeasurements.leftArmCm,
    notes: bodyMeasurements.notes,
  })
    .from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, session.user.id))
    .orderBy(desc(bodyMeasurements.measuredAt))
    .limit(50)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = generateId()
  await db.insert(bodyMeasurements).values({
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
  })

  return NextResponse.json({ id })
}
