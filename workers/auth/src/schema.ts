import { z } from 'zod'

export const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const OAuthSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  oauth_provider: z.string(),
  oauth_id: z.string()
})
