import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { aiConversations, aiMessages } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const convs = await db.select().from(aiConversations)
    .where(eq(aiConversations.userId, uid))
    .orderBy(desc(aiConversations.updatedAt))
    .limit(30)

  return NextResponse.json(convs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const { title } = await req.json().catch(() => ({}))

  const id = generateId()
  await db.insert(aiConversations).values({ id, userId: uid, title: title ?? null })

  return NextResponse.json({ id })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  const { conversationId, role, content } = await req.json()
  if (!conversationId || !role || !content) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const [conv] = await db.select().from(aiConversations)
    .where(and(eq(aiConversations.userId, uid), eq(aiConversations.id, conversationId)))
    .limit(1)
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.insert(aiMessages).values({ id: generateId(), conversationId, role, content })
  await db.update(aiConversations)
    .set({ updatedAt: new Date() })
    .where(eq(aiConversations.id, conversationId))

  return NextResponse.json({ ok: true })
}
