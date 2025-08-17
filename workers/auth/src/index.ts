import { authMiddleware } from '@packages/middlewares/auth';
import { Hono } from 'hono'
import { zValidator } from '../../../packages/utils/validation-wrapper'
import { SignupSchema, LoginSchema } from './schema'
import type { MyEnv } from '../../../packages/types'
import { errorHandler } from '../../../packages/middlewares/error'
import { login, logout, signup } from './controllers/admin.controller';
import { auth } from 'hono/utils/basic-auth'

const app = new Hono<MyEnv>()


// Secret for JWT

// health check
app.get('/health', (c) => {
  return c.json({ status: 'ok'  })
})
//dbcheck
app.get('/debug/tables', async (c) => {
  const result = await c.env.DB
    .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
    .all()

  return c.json(result)
})
// --- Signup
app.post(
  '/signup',
  zValidator('json', SignupSchema),
  signup
)

// --- Login
app.post(
  '/login',
  zValidator('json', LoginSchema),
  login
  
)
//logout
app.put('/logout', authMiddleware , logout)

  app.onError(errorHandler)

export default app
