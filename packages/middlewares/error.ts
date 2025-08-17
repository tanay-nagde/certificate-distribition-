import { ZodError } from 'zod'
import { HTTPException } from 'hono/http-exception'
import type { ErrorHandler } from 'hono'
import type{ MyEnv } from '@packages/types'

export const errorHandler: ErrorHandler<MyEnv> = (err, c) => {
  // ZodError wrapped in HTTPException
  if (err instanceof HTTPException && err.cause instanceof ZodError) {
    const formatted = err.cause.issues.map((e) => ({
      field: e.path.join('.'),
      error: e.message,
    }))

    return c.json(
      {
        success: false,
        error: {
          name: 'ZodError',
          message: formatted,
        },
      },
      400
    )
  }



  // Other HTTPExceptions with cause
  if (err instanceof HTTPException && err.cause instanceof Error) {
    return c.json(
      {
        success: false,
        error: {
          name: err.cause.name,
          message: err.cause.message,
        },
      },
      err.status
    )
  }

  // Generic fallback
  return c.json(
    {
      success: false,
      error: {
        name: err.name || 'Error',
        message: err.message || 'Something went wrong',
      },
    },
    500
  )
}
