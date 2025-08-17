import type { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'

type UserPayload = {
 id: string
 email: string
 name?: string
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
 const authHeader = c.req.header('Authorization')
 const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
 const tokenFromCookie = getCookie(c, 'token')
 const token = tokenFromHeader || tokenFromCookie

 if (!token) {
  return c.json(
   {
    success: false,
    error: {
     name: 'Unauthorized',
     message: 'Missing token in header or cookie',
    },
   },
   401
  )
 }

 try {
  const payload = await verify(token, c.env.JWT)
  c.set('user', payload as UserPayload)
  // Corrected: Return the result of the next middleware
  return await next()
 } catch (err) {
  return c.json(
   {
    success: false,
    error: {
     name: 'Unauthorized',
     message: 'Invalid or expired token',
    },
   },
   401
  )
 }
}