import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import path from 'path'

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), 'fitos.db')

// Singleton for Next.js hot-reload
const globalForDb = globalThis as unknown as { _db?: ReturnType<typeof drizzle> }

if (!globalForDb._db) {
  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  globalForDb._db = drizzle(sqlite, { schema })
}

const db = globalForDb._db!
export default db
