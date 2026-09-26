import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = db.select().from(profiles).where(eq(profiles.userId, session.user.id)).get()
  return NextResponse.json(profile ?? null)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const userId = session.user.id

  const existing = db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, userId)).get()

  if (existing) {
    db.update(profiles)
      .set({
        goal: body.goal,
        level: body.level,
        weeklyFrequency: body.weeklyFrequency,
        sessionDurationMin: body.sessionDurationMin,
        equipment: body.equipment ? JSON.stringify(body.equipment) : null,
        language: body.language,
        units: body.units,
        theme: body.theme,
        onboardingDone: body.onboardingDone,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .run()
  } else {
    db.insert(profiles).values({
      id: generateId(),
      userId,
      goal: body.goal,
      level: body.level,
      weeklyFrequency: body.weeklyFrequency,
      sessionDurationMin: body.sessionDurationMin,
      equipment: body.equipment ? JSON.stringify(body.equipment) : null,
      language: body.language ?? 'it',
      units: body.units ?? 'metric',
      theme: body.theme ?? 'dark',
      onboardingDone: body.onboardingDone ?? false,
    }).run()
  }

  return NextResponse.json({ ok: true })
}
