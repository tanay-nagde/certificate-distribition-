import type { D1Database } from '@cloudflare/workers-types'
import type { Admin } from '@packages/types'
import { v4 as uuidv4 } from 'uuid'

type AdminWithoutPassword = Omit<Admin, 'password_hash' | 'created_at'>

// Create a new admin (with or without password)
export async function createAdmin(
  db: D1Database,
  admin: Omit<Admin, 'id' | 'created_at'>
) {
  const { name, email, password_hash, oauth_provider, oauth_id } = admin

  const id = uuidv4() // Generate unique ID

  await db.prepare(`
      INSERT INTO admins (id, name, email, password_hash, oauth_provider, oauth_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      name,
      email,
      password_hash ?? null,
      oauth_provider ?? null,
      oauth_id ?? null
    )
    .run()

  
}

// Get admin by email
export async function getAdminByEmail(
  db: D1Database,
  email: string
): Promise<Admin | null> {
  const result = await db
    .prepare(`SELECT * FROM admins WHERE email = ?`)
    .bind(email)
    .first<Admin>()

  return result ?? null
}

// Get admin by ID
export async function getAdminById(
  db: D1Database,
  id: string
): Promise<AdminWithoutPassword | null> {
  const result = await db
    .prepare(`SELECT * FROM admins WHERE id = ?`)
    .bind(id)
    .first<AdminWithoutPassword>()

  return result ?? null
}
