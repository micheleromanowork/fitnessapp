import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { profiles, workouts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const { messages, lang = 'en' } = await req.json()

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) {
    const fallback = lang === 'it'
      ? 'Il Coach AI è disponibile quando viene configurata la chiave GROQ_API_KEY. Per ora: allenarsi con costanza è il segreto del progresso!'
      : 'AI Coach is available once GROQ_API_KEY is configured. For now: consistency is the secret to progress!'
    return NextResponse.json({ role: 'assistant', content: fallback })
  }

  // Build context from user profile + recent workouts
  const profile = db.select().from(profiles).where(eq(profiles.userId, uid)).get()
  const recentWorkouts = db.select().from(workouts)
    .where(eq(workouts.userId, uid))
    .orderBy(desc(workouts.startedAt))
    .limit(5)
    .all()

  const it = lang === 'it'
  const systemPrompt = it
    ? `Sei FitOS Coach, un personal trainer AI esperto. Rispondi sempre in italiano in modo conciso (max 150 parole).
Profilo utente: obiettivo=${profile?.goal ?? 'non specificato'}, livello=${profile?.level ?? 'intermedio'}, frequenza=${profile?.weeklyFrequency ?? 3} giorni/settimana.
Ultimi ${recentWorkouts.length} allenamenti completati: volume medio ${
  recentWorkouts.length
    ? Math.round(recentWorkouts.reduce((a, w) => a + (w.totalVolumeKg ?? 0), 0) / recentWorkouts.length)
    : 0
} kg, durata media ${
  recentWorkouts.length
    ? Math.round(recentWorkouts.reduce((a, w) => a + (w.durationSec ?? 0), 0) / recentWorkouts.length / 60)
    : 0
} min.
Dai consigli pratici, motivanti e basati sui dati reali dell'utente.`
    : `You are FitOS Coach, an expert AI personal trainer. Always respond in English concisely (max 150 words).
User profile: goal=${profile?.goal ?? 'not set'}, level=${profile?.level ?? 'intermediate'}, frequency=${profile?.weeklyFrequency ?? 3} days/week.
Last ${recentWorkouts.length} completed workouts: avg volume ${
  recentWorkouts.length
    ? Math.round(recentWorkouts.reduce((a, w) => a + (w.totalVolumeKg ?? 0), 0) / recentWorkouts.length)
    : 0
} kg, avg duration ${
  recentWorkouts.length
    ? Math.round(recentWorkouts.reduce((a, w) => a + (w.durationSec ?? 0), 0) / recentWorkouts.length / 60)
    : 0
} min.
Give practical, motivating advice grounded in the user's real data.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-8), // keep last 8 messages for context
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      }),
    })

    if (!res.ok) throw new Error(`Groq error ${res.status}`)

    // Stream SSE response as-is
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
