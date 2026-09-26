import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import db from '@/lib/db/client'
import { aiConversations, aiMessages } from '@/lib/db/schema'
import { eq, asc, and } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id
  const { id } = await params

  const [conv] = await db.select().from(aiConversations)
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, uid)))
    .limit(1)
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const msgs = await db.select().from(aiMessages)
    .where(eq(aiMessages.conversationId, id))
    .orderBy(asc(aiMessages.createdAt))

  return NextResponse.json(msgs)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id
  const { id } = await params

  const [conv] = await db.select().from(aiConversations)
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, uid)))
    .limit(1)
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.delete(aiConversations).where(eq(aiConversations.id, id))
  return NextResponse.json({ ok: true })
}
