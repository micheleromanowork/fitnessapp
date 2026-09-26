import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db/client'
import { exercises } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const lang = (req.nextUrl.searchParams.get('lang') ?? 'en') as 'en' | 'it'

  try {
    const [ex] = await db
      .select()
      .from(exercises)
      .where(or(eq(exercises.id, params.id), eq(exercises.slug, params.id)))

    if (!ex) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    return NextResponse.json({
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
      videoUrl: ex.videoUrl,
      imageUrl: ex.imageUrl,
    })
  } catch (err) {
    console.error('[API /exercises/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}
