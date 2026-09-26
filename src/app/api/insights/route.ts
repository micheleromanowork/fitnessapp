import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { aiInsights, profiles, workouts, personalRecords, exercises } from '@/lib/db/schema'
import { eq, desc, and, gt } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

const TTL_MS = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id
  const lang = (req.nextUrl.searchParams.get('lang') ?? 'en') as 'en' | 'it'

  const now = new Date()

  const [cached] = await db.select().from(aiInsights)
    .where(and(eq(aiInsights.userId, uid), gt(aiInsights.expiresAt, now)))
    .orderBy(desc(aiInsights.createdAt))
    .limit(1)

  if (cached) {
    return NextResponse.json({
      content: lang === 'it' ? cached.contentIt : cached.contentEn,
      type: cached.type,
    })
  }

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return NextResponse.json({ content: null })

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, uid)).limit(1)
  const recentWorkouts = await db.select().from(workouts)
    .where(eq(workouts.userId, uid))
    .orderBy(desc(workouts.startedAt))
    .limit(7)
  const topPRs = await db.select({
    exerciseName: exercises.nameEn,
    weightKg: personalRecords.weightKg,
    reps: personalRecords.reps,
  })
    .from(personalRecords)
    .leftJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .where(and(eq(personalRecords.userId, uid), eq(personalRecords.type, 'weight')))
    .orderBy(desc(personalRecords.value))
    .limit(3)

  const count = recentWorkouts.length
  const avgVol = count ? Math.round(recentWorkouts.reduce((a, w) => a + (w.totalVolumeKg ?? 0), 0) / count) : 0
  const prLine = topPRs.map(p => `${p.exerciseName}: ${p.weightKg}kg×${p.reps}`).join(', ')

  const promptEn = `You are a fitness AI. Generate ONE brief motivating insight (1-2 sentences, max 50 words) for a user.
User: goal=${profile?.goal ?? 'general_fitness'}, level=${profile?.level ?? 'intermediate'}, ${count} workouts this week, avg volume ${avgVol}kg.${prLine ? ` Top PRs: ${prLine}.` : ''}
Respond ONLY with the insight text. No preamble, no JSON.`

  const promptIt = `Sei un AI fitness. Genera UN breve insight motivante (1-2 frasi, max 50 parole) per un utente.
Utente: obiettivo=${profile?.goal ?? 'general_fitness'}, livello=${profile?.level ?? 'intermediate'}, ${count} allenamenti questa settimana, volume medio ${avgVol}kg.${prLine ? ` Record: ${prLine}.` : ''}
Rispondi SOLO con il testo dell'insight. Niente preamboli, niente JSON.`

  try {
    const call = (prompt: string) =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.8,
        }),
      })

    const [resEn, resIt] = await Promise.all([call(promptEn), call(promptIt)])
    if (!resEn.ok || !resIt.ok) throw new Error(`Groq error`)

    const [dEn, dIt] = await Promise.all([resEn.json(), resIt.json()])
    const contentEn = (dEn.choices?.[0]?.message?.content ?? '').trim()
    const contentIt = (dIt.choices?.[0]?.message?.content ?? '').trim()
    if (!contentEn || !contentIt) throw new Error('Empty response')

    const type = count === 0 ? 'suggestion' : 'progress'

    await db.insert(aiInsights).values({
      id: generateId(),
      userId: uid,
      type,
      contentEn,
      contentIt,
      expiresAt: new Date(Date.now() + TTL_MS),
    })

    return NextResponse.json({ content: lang === 'it' ? contentIt : contentEn, type })
  } catch (err) {
    console.error('[Insights]', err)
    return NextResponse.json({ content: null })
  }
}
