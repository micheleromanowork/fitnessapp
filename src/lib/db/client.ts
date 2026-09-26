import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { _db?: ReturnType<typeof drizzle> }

if (!globalForDb._db) {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL ?? 'file:./fitos.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  globalForDb._db = drizzle(client, { schema })
}

const db = globalForDb._db!
export default db
