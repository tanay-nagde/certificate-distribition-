import { db } from './../../../../packages/db/client';
import { apiError } from './../../../../packages/utils/apiError-wrapper';
import { Context } from "hono"
import { createAdmin, getAdminByEmail, getAdminById } from "../../../../packages/db/queries/admin"
import { oauth_providers } from "../../../../packages/types"
import { hashPassword, verifyPassword } from "../utils/hash"
import { HTTPException } from 'hono/http-exception';
import { sign } from 'hono/jwt';
import { deleteCookie, setCookie } from 'hono/cookie';

// Controller for admin signup
export const signup = async (c:Context) => {
    try {
        
    const body = await c.req.json()
  
   
    const existing = await getAdminByEmail(c.env.DB, body.email)
    if (existing) 
     throw apiError(400, 'Email already exists', 'EmailExistsError')   

    const password_hash = await hashPassword(body.password)

    await createAdmin(c.env.DB, {
      name: body.name,
      email: body.email,
      password_hash,
      oauth_provider: oauth_providers.CUSTOM,
      oauth_id: ""
    })

    return c.json({ success: true }, 201)
        
    } catch (error) {

        throw new HTTPException(500, { cause: error })

    }
  }

// Controller for admin login
export const login = async (c: Context) => {
    const { email, password } = await c.req.json()
    const admin = await getAdminByEmail(c.env.DB, email)
    if (!admin || !admin.password_hash)
      throw apiError(401, 'Invalid credentials', 'InvalidCredentialsError')

    const isValid = await verifyPassword(password, admin.password_hash)
    if (!isValid) throw apiError(401, 'Invalid credentials', 'InvalidCredentialsError')

    const token = await sign({ id: admin.id, email: admin.email }, c.env.JWT)
    setCookie(c, 'token', token, {
      httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
    })

    return c.json({ ...admin , password_hash: undefined }, 200)
   
  }
  
// Controller for admin logout
export const logout = async (c: Context) => {
  deleteCookie(c, 'token')
  return c.json({ success: true  , message: 'Logged out successfully' }, 200)
}
export const getCurrentAdmin = async (c: Context) => {
  const u = c.get('user')
  const user = await getAdminById(c.env.DB, u.id)
  if (!user) {
    throw apiError(401, 'Unauthorized', 'UnauthorizedError')
  }
const returnuser = {
  id: user.id,
  email: user.email,
  name: user.name
}


  return c.json({ data:returnuser }, 200)
}
