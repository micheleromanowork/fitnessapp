import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { exercises } from '@/lib/db/schema'

export const runtime = 'nodejs'

// Returns a structured program JSON compatible with POST /api/programs body
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { goal = 'muscle_gain', level = 'intermediate', daysPerWeek = 3, lang = 'en' } = body

  // If Groq key is available, use AI; otherwise fall back to a template
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    return generateWithGroq(goal, level, daysPerWeek, lang, groqKey)
  }
  return generateTemplate(goal, level, daysPerWeek, lang, session.user.id)
}

async function generateWithGroq(
  goal: string, level: string, daysPerWeek: number,
  lang: string, apiKey: string
) {
  const it = lang === 'it'
  const prompt = it
    ? `Crea un programma di allenamento con queste caratteristiche:
- Obiettivo: ${goal}
- Livello: ${level}
- Giorni/settimana: ${daysPerWeek}
Rispondi SOLO con un JSON valido in questo formato esatto (nessun testo prima o dopo):
{"name":"nome programma","description":"breve descrizione","days":[{"name":"Giorno 1 - Nome","targetMuscles":["pettorali","tricipiti"],"exercises":[{"exerciseId":"bench-press","sets":4,"repsMin":8,"repsMax":12,"restSec":90}]}]}
Usa solo questi exerciseId validi: bench-press, incline-bench-press, dumbbell-fly, chest-dip, cable-crossover, push-up, decline-bench-press, dumbbell-press, pec-deck, svend-press, pull-up, chin-up, lat-pulldown, barbell-row, dumbbell-row, cable-row, deadlift, romanian-deadlift, face-pull, cable-straight-arm-pulldown, overhead-press, dumbbell-shoulder-press, lateral-raise, arnold-press, barbell-curl, dumbbell-curl, hammer-curl, close-grip-bench, skull-crusher, tricep-dips, cable-pushdown, barbell-squat, leg-press, lunges, bulgarian-split-squat, leg-curl, leg-extension, calf-raise, hip-thrust, plank, crunch, leg-raise, russian-twist.`
    : `Create a workout program with these specs:
- Goal: ${goal}
- Level: ${level}
- Days/week: ${daysPerWeek}
Reply ONLY with valid JSON in this exact format (no text before or after):
{"name":"program name","description":"brief description","days":[{"name":"Day 1 - Name","targetMuscles":["chest","triceps"],"exercises":[{"exerciseId":"bench-press","sets":4,"repsMin":8,"repsMax":12,"restSec":90}]}]}
Use only these valid exerciseIds: bench-press, incline-bench-press, dumbbell-fly, chest-dip, cable-crossover, push-up, decline-bench-press, dumbbell-press, pec-deck, svend-press, pull-up, chin-up, lat-pulldown, barbell-row, dumbbell-row, cable-row, deadlift, romanian-deadlift, face-pull, cable-straight-arm-pulldown, overhead-press, dumbbell-shoulder-press, lateral-raise, arnold-press, barbell-curl, dumbbell-curl, hammer-curl, close-grip-bench, skull-crusher, tricep-dips, cable-pushdown, barbell-squat, leg-press, lunges, bulgarian-split-squat, leg-curl, leg-extension, calf-raise, hip-thrust, plank, crunch, leg-raise, russian-twist.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const program = JSON.parse(jsonMatch[0])
    // Map slug-based exerciseIds to actual DB ids
    const allEx = db.select({ id: exercises.id, slug: exercises.slug }).from(exercises).all()
    const slugMap = Object.fromEntries(allEx.map(e => [e.slug, e.id]))
    for (const day of program.days ?? []) {
      for (const ex of day.exercises ?? []) {
        ex.exerciseId = slugMap[ex.exerciseId] ?? ex.exerciseId
      }
    }
    return NextResponse.json({ ...program, isAiGenerated: true, goal, level, daysPerWeek })
  } catch {
    // Fall back to template on any error
    return generateTemplate(goal, level, daysPerWeek, lang, '')
  }
}

function generateTemplate(goal: string, level: string, daysPerWeek: number, lang: string, _userId: string) {
  const it = lang === 'it'
  const allEx = db.select({ id: exercises.id, slug: exercises.slug }).from(exercises).all()
  const slugMap = Object.fromEntries(allEx.map(e => [e.slug, e.id]))
  const s = (slug: string) => slugMap[slug] ?? slug

  const templates: Record<string, { name: string; nameIt: string; desc: string; descIt: string; days: unknown[] }> = {
    '3': {
      name: 'Full Body 3x', nameIt: 'Full Body 3x',
      desc: '3-day full body workout', descIt: 'Allenamento full body 3 giorni',
      days: [
        { name: it ? 'Giorno A — Push/Squat' : 'Day A — Push/Squat', targetMuscles: it ? ['pettorali','quadricipiti'] : ['chest','quads'],
          exercises: [{ exerciseId: s('barbell-squat'), sets:4, repsMin:6, repsMax:10, restSec:120 }, { exerciseId: s('bench-press'), sets:4, repsMin:8, repsMax:12, restSec:90 }, { exerciseId: s('overhead-press'), sets:3, repsMin:8, repsMax:12, restSec:90 }, { exerciseId: s('plank'), sets:3, repsMin:30, repsMax:60, restSec:60 }] },
        { name: it ? 'Giorno B — Pull/Hinge' : 'Day B — Pull/Hinge', targetMuscles: it ? ['schiena','bicipiti'] : ['back','biceps'],
          exercises: [{ exerciseId: s('deadlift'), sets:4, repsMin:5, repsMax:8, restSec:120 }, { exerciseId: s('pull-up'), sets:4, repsMin:5, repsMax:10, restSec:90 }, { exerciseId: s('dumbbell-row'), sets:3, repsMin:10, repsMax:15, restSec:75 }, { exerciseId: s('barbell-curl'), sets:3, repsMin:10, repsMax:15, restSec:60 }] },
        { name: it ? 'Giorno C — Lower/Core' : 'Day C — Lower/Core', targetMuscles: it ? ['glutei','core'] : ['glutes','core'],
          exercises: [{ exerciseId: s('hip-thrust'), sets:4, repsMin:10, repsMax:15, restSec:90 }, { exerciseId: s('leg-press'), sets:3, repsMin:12, repsMax:15, restSec:75 }, { exerciseId: s('leg-curl'), sets:3, repsMin:12, repsMax:15, restSec:60 }, { exerciseId: s('crunch'), sets:3, repsMin:15, repsMax:20, restSec:45 }] },
      ],
    },
    '4': {
      name: 'Upper/Lower 4x', nameIt: 'Upper/Lower 4x',
      desc: '4-day upper/lower split', descIt: 'Split upper/lower 4 giorni',
      days: [
        { name: it ? 'Upper A — Forza' : 'Upper A — Strength', targetMuscles: it ? ['pettorali','schiena'] : ['chest','back'],
          exercises: [{ exerciseId: s('bench-press'), sets:4, repsMin:5, repsMax:8, restSec:120 }, { exerciseId: s('barbell-row'), sets:4, repsMin:5, repsMax:8, restSec:120 }, { exerciseId: s('overhead-press'), sets:3, repsMin:6, repsMax:10, restSec:90 }, { exerciseId: s('lat-pulldown'), sets:3, repsMin:8, repsMax:12, restSec:75 }] },
        { name: it ? 'Lower A — Forza' : 'Lower A — Strength', targetMuscles: it ? ['quadricipiti','glutei'] : ['quads','glutes'],
          exercises: [{ exerciseId: s('barbell-squat'), sets:4, repsMin:5, repsMax:8, restSec:120 }, { exerciseId: s('romanian-deadlift'), sets:3, repsMin:8, repsMax:12, restSec:90 }, { exerciseId: s('leg-press'), sets:3, repsMin:10, repsMax:15, restSec:75 }, { exerciseId: s('calf-raise'), sets:4, repsMin:15, repsMax:20, restSec:45 }] },
        { name: it ? 'Upper B — Ipertrofia' : 'Upper B — Hypertrophy', targetMuscles: it ? ['spalle','braccia'] : ['shoulders','arms'],
          exercises: [{ exerciseId: s('incline-bench-press'), sets:4, repsMin:10, repsMax:15, restSec:75 }, { exerciseId: s('dumbbell-row'), sets:4, repsMin:10, repsMax:15, restSec:75 }, { exerciseId: s('lateral-raise'), sets:3, repsMin:15, repsMax:20, restSec:60 }, { exerciseId: s('dumbbell-curl'), sets:3, repsMin:12, repsMax:15, restSec:60 }, { exerciseId: s('skull-crusher'), sets:3, repsMin:12, repsMax:15, restSec:60 }] },
        { name: it ? 'Lower B — Ipertrofia' : 'Lower B — Hypertrophy', targetMuscles: it ? ['posteriori','core'] : ['hamstrings','core'],
          exercises: [{ exerciseId: s('hip-thrust'), sets:4, repsMin:12, repsMax:15, restSec:75 }, { exerciseId: s('bulgarian-split-squat'), sets:3, repsMin:10, repsMax:15, restSec:75 }, { exerciseId: s('leg-curl'), sets:3, repsMin:12, repsMax:15, restSec:60 }, { exerciseId: s('leg-raise'), sets:3, repsMin:15, repsMax:20, restSec:45 }] },
      ],
    },
    '5': {
      name: 'PPL 5-Day', nameIt: 'PPL 5 Giorni',
      desc: 'Push/Pull/Legs 5-day split', descIt: 'Split Push/Pull/Legs 5 giorni',
      days: [
        { name: it ? 'Push — Pettorali+Spalle+Tricipiti' : 'Push — Chest+Shoulders+Triceps', targetMuscles: it ? ['pettorali','spalle','tricipiti'] : ['chest','shoulders','triceps'],
          exercises: [{ exerciseId: s('bench-press'), sets:4, repsMin:8, repsMax:12, restSec:90 }, { exerciseId: s('incline-bench-press'), sets:3, repsMin:10, repsMax:15, restSec:75 }, { exerciseId: s('overhead-press'), sets:3, repsMin:10, repsMax:12, restSec:90 }, { exerciseId: s('lateral-raise'), sets:3, repsMin:15, repsMax:20, restSec:60 }, { exerciseId: s('cable-pushdown'), sets:3, repsMin:12, repsMax:15, restSec:60 }] },
        { name: it ? 'Pull — Schiena+Bicipiti' : 'Pull — Back+Biceps', targetMuscles: it ? ['schiena','bicipiti'] : ['back','biceps'],
          exercises: [{ exerciseId: s('pull-up'), sets:4, repsMin:6, repsMax:10, restSec:90 }, { exerciseId: s('barbell-row'), sets:4, repsMin:8, repsMax:12, restSec:90 }, { exerciseId: s('lat-pulldown'), sets:3, repsMin:10, repsMax:15, restSec:75 }, { exerciseId: s('face-pull'), sets:3, repsMin:15, repsMax:20, restSec:60 }, { exerciseId: s('dumbbell-curl'), sets:3, repsMin:12, repsMax:15, restSec:60 }] },
        { name: it ? 'Legs — Gambe' : 'Legs', targetMuscles: it ? ['quadricipiti','glutei','posteriori'] : ['quads','glutes','hamstrings'],
          exercises: [{ exerciseId: s('barbell-squat'), sets:4, repsMin:8, repsMax:12, restSec:120 }, { exerciseId: s('romanian-deadlift'), sets:3, repsMin:10, repsMax:15, restSec:90 }, { exerciseId: s('leg-press'), sets:3, repsMin:12, repsMax:15, restSec:75 }, { exerciseId: s('leg-curl'), sets:3, repsMin:12, repsMax:15, restSec:60 }, { exerciseId: s('calf-raise'), sets:4, repsMin:15, repsMax:20, restSec:45 }] },
        { name: it ? 'Upper — Forza' : 'Upper — Strength', targetMuscles: it ? ['pettorali','schiena'] : ['chest','back'],
          exercises: [{ exerciseId: s('bench-press'), sets:5, repsMin:3, repsMax:6, restSec:180 }, { exerciseId: s('deadlift'), sets:4, repsMin:3, repsMax:5, restSec:180 }, { exerciseId: s('overhead-press'), sets:3, repsMin:5, repsMax:8, restSec:120 }, { exerciseId: s('chin-up'), sets:3, repsMin:6, repsMax:10, restSec:90 }] },
        { name: it ? 'Lower — Accessori' : 'Lower — Accessories', targetMuscles: it ? ['glutei','core'] : ['glutes','core'],
          exercises: [{ exerciseId: s('hip-thrust'), sets:4, repsMin:12, repsMax:15, restSec:75 }, { exerciseId: s('bulgarian-split-squat'), sets:3, repsMin:10, repsMax:15, restSec:75 }, { exerciseId: s('leg-extension'), sets:3, repsMin:15, repsMax:20, restSec:60 }, { exerciseId: s('plank'), sets:3, repsMin:30, repsMax:60, restSec:45 }] },
      ],
    },
  }

  const tpl = templates[String(daysPerWeek)] ?? templates['3']
  return NextResponse.json({
    name: it ? tpl.nameIt : tpl.name,
    description: it ? tpl.descIt : tpl.desc,
    goal, level, daysPerWeek,
    days: tpl.days,
    isAiGenerated: false,
  })
}
