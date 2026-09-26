import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import path from 'path'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? `file:${path.join(process.cwd(), 'fitos.db')}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const db = drizzle(client)

await migrate(db, { migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations') })
console.log('✓ Migrations complete')
client.close()
