import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { profiles, workouts, personalRecords, exercises, bodyMeasurements, aiConversations, aiMessages } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const { messages, lang = 'en', conversationId, userMessage } = await req.json()

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) {
    const fallback = lang === 'it'
      ? 'Il Coach AI è disponibile quando viene configurata la chiave GROQ_API_KEY. Per ora: allenarsi con costanza è il segreto del progresso!'
      : 'AI Coach is available once GROQ_API_KEY is configured. For now: consistency is the secret to progress!'
    return NextResponse.json({ role: 'assistant', content: fallback })
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, uid)).limit(1)
  const recentWorkouts = await db.select().from(workouts)
    .where(eq(workouts.userId, uid))
    .orderBy(desc(workouts.startedAt))
    .limit(5)

  const topPRs = await db.select({
    exerciseName: exercises.nameEn,
    exerciseNameIt: exercises.nameIt,
    weightKg: personalRecords.weightKg,
    reps: personalRecords.reps,
  })
    .from(personalRecords)
    .leftJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .where(and(eq(personalRecords.userId, uid), eq(personalRecords.type, 'weight')))
    .orderBy(desc(personalRecords.value))
    .limit(5)

  const [latestMeasurement] = await db.select().from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, uid))
    .orderBy(desc(bodyMeasurements.measuredAt))
    .limit(1)

  const it = lang === 'it'
  const avgVol = recentWorkouts.length
    ? Math.round(recentWorkouts.reduce((a, w) => a + (w.totalVolumeKg ?? 0), 0) / recentWorkouts.length)
    : 0
  const avgDur = recentWorkouts.length
    ? Math.round(recentWorkouts.reduce((a, w) => a + (w.durationSec ?? 0), 0) / recentWorkouts.length / 60)
    : 0

  const prLines = topPRs.map(p =>
    `${it ? p.exerciseNameIt ?? p.exerciseName : p.exerciseName}: ${p.weightKg}kg × ${p.reps} reps`
  ).join(', ')

  const bodyLine = latestMeasurement
    ? (it
      ? `Peso: ${latestMeasurement.weightKg ?? '?'}kg, BF: ${latestMeasurement.bodyFatPct ?? '?'}%`
      : `Weight: ${latestMeasurement.weightKg ?? '?'}kg, BF: ${latestMeasurement.bodyFatPct ?? '?'}%`)
    : ''

  const systemPrompt = it
    ? `Sei FitOS Coach, un personal trainer AI esperto. Rispondi sempre in italiano in modo conciso (max 150 parole).
Profilo: obiettivo=${profile?.goal ?? 'non specificato'}, livello=${profile?.level ?? 'intermedio'}, frequenza=${profile?.weeklyFrequency ?? 3} giorni/settimana.
Ultimi ${recentWorkouts.length} allenamenti: volume medio ${avgVol}kg, durata media ${avgDur}min.${prLines ? `\nRecord personali: ${prLines}.` : ''}${bodyLine ? `\nMisurazioni: ${bodyLine}.` : ''}
Dai consigli pratici, motivanti e basati sui dati reali dell'utente.`
    : `You are FitOS Coach, an expert AI personal trainer. Always respond in English concisely (max 150 words).
Profile: goal=${profile?.goal ?? 'not set'}, level=${profile?.level ?? 'intermediate'}, frequency=${profile?.weeklyFrequency ?? 3} days/week.
Last ${recentWorkouts.length} workouts: avg volume ${avgVol}kg, avg duration ${avgDur}min.${prLines ? `\nPersonal records: ${prLines}.` : ''}${bodyLine ? `\nBody stats: ${bodyLine}.` : ''}
Give practical, motivating advice grounded in the user's real data.`

  if (conversationId && userMessage) {
    const [conv] = await db.select().from(aiConversations)
      .where(and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, uid)))
      .limit(1)
    if (conv) {
      await db.insert(aiMessages).values({
        id: generateId(), conversationId, role: 'user', content: userMessage,
      })
      await db.update(aiConversations)
        .set({ updatedAt: new Date() })
        .where(eq(aiConversations.id, conversationId))
    }
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-8),
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      }),
    })

    if (!res.ok) throw new Error(`Groq error ${res.status}`)

    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[AI Chat]', err)
    const msg = it ? 'Errore di connessione al servizio AI. Riprova.' : 'AI service connection error. Please try again.'
    return NextResponse.json({ role: 'assistant', content: msg })
  }
}
