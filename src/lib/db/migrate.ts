import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), 'fitos.db')
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
const db = drizzle(sqlite)

migrate(db, { migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations') })
console.log('✓ Migrations complete')
sqlite.close()
