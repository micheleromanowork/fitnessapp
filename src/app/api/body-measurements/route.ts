import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { bodyMeasurements } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = db.select({
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
    .all()

  return NextResponse.json(rows)
}
