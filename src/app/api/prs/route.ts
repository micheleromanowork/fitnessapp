import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { personalRecords, exercises } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const exerciseId = req.nextUrl.searchParams.get('exerciseId')
  const lang = (req.nextUrl.searchParams.get('lang') ?? 'en') as 'en' | 'it'

  const conditions = [eq(personalRecords.userId, uid)]
  if (exerciseId) conditions.push(eq(personalRecords.exerciseId, exerciseId))

  const rows = db.select({
    id: personalRecords.id,
    exerciseId: personalRecords.exerciseId,
    type: personalRecords.type,
    value: personalRecords.value,
    weightKg: personalRecords.weightKg,
    reps: personalRecords.reps,
    workoutId: personalRecords.workoutId,
    achievedAt: personalRecords.achievedAt,
    exerciseNameEn: exercises.nameEn,
    exerciseNameIt: exercises.nameIt,
  })
    .from(personalRecords)
    .leftJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .where(and(...conditions))
    .orderBy(desc(personalRecords.achievedAt))
    .all()

  return NextResponse.json(rows.map(r => ({
    ...r,
    exerciseName: lang === 'it' ? r.exerciseNameIt : r.exerciseNameEn,
  })))
}
