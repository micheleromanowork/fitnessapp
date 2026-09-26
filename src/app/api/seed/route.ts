import { NextRequest, NextResponse } from 'next/server'
import { runSeed } from '@/lib/db/seed'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSeed()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[Seed]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
