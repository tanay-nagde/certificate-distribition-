// db/client.ts
import { D1Database } from '@cloudflare/workers-types'

export let db: D1Database

export const setDB = (database: D1Database) => {
  db = database
}
