import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import db from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: { type: 'email' } },
      async authorize(credentials) {
        const email = credentials?.email as string
        if (!email) return null
        let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
        if (!user) {
          const id = generateId()
          await db.insert(users).values({ id, email, name: email.split('@')[0] })
          ;[user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
        }
        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
})
