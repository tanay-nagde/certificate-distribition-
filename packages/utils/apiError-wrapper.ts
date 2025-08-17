import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export const apiError = (
  status: ContentfulStatusCode,
  message: string,
  name = 'systemError'
): never => {
  const error = new Error(message)
  error.name = name
  throw new HTTPException(status, { cause: error })
}