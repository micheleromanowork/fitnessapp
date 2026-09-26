import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db/client'
import { exercises } from '@/lib/db/schema'
import { like, and, eq, or } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const q          = searchParams.get('q') ?? ''
  const muscle     = searchParams.get('muscle') ?? ''
  const equipment  = searchParams.get('equipment') ?? ''
  const difficulty = searchParams.get('difficulty') ?? ''
  const movement   = searchParams.get('movement') ?? ''
  const lang       = (searchParams.get('lang') ?? 'en') as 'en' | 'it'
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit      = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const offset     = (page - 1) * limit

  try {
    const conditions: SQL[] = []

    if (q) {
      conditions.push(
        or(
          like(exercises.nameEn, `%${q}%`),
          like(exercises.nameIt, `%${q}%`),
          like(exercises.tags, `%${q}%`),
        )!
      )
    }
    if (difficulty) {
      conditions.push(eq(exercises.difficulty, difficulty))
    }
    if (movement) {
      conditions.push(eq(exercises.movementType, movement))
    }
    if (equipment) {
      conditions.push(eq(exercises.equipmentId, equipment))
    }
    if (muscle) {
      conditions.push(
        or(
          like(exercises.primaryMuscles, `%"${muscle}"%`),
          like(exercises.secondaryMuscles, `%"${muscle}"%`),
        )!
      )
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const rows = db
      .select()
      .from(exercises)
      .where(where)
      .limit(limit)
      .offset(offset)
      .all()

    const total = db
      .select({ id: exercises.id })
      .from(exercises)
      .where(where)
      .all().length

    const data = rows.map(ex => ({
      id: ex.id,
      slug: ex.slug,
      name: lang === 'it' ? ex.nameIt : ex.nameEn,
      nameEn: ex.nameEn,
      nameIt: ex.nameIt,
      description: lang === 'it' ? ex.descriptionIt : ex.descriptionEn,
      primaryMuscles: safeJson<string[]>(ex.primaryMuscles, []),
      secondaryMuscles: safeJson<string[]>(ex.secondaryMuscles, []),
      equipmentId: ex.equipmentId,
      difficulty: ex.difficulty,
      movementType: ex.movementType,
      instructions: safeJson<string[]>(lang === 'it' ? ex.instructionsIt : ex.instructionsEn, []),
      mistakes: safeJson<string[]>(lang === 'it' ? ex.mistakesIt : ex.mistakesEn, []),
      tips: safeJson<string[]>(lang === 'it' ? ex.tipsIt : ex.tipsEn, []),
      breathing: lang === 'it' ? ex.breathingIt : ex.breathingEn,
      alternatives: safeJson<string[]>(ex.alternatives, []),
      tags: safeJson<string[]>(ex.tags, []),
    }))

    return NextResponse.json({
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('[API /exercises]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}
