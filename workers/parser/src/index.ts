import { errorHandler } from '@packages/middlewares/error';
import type { MyEnv } from '@packages/types';

import { Hono } from 'hono';
import templatesRoutes from './routes/templates';
import uploadsRoutes from './routes/uploads';
import { cors } from 'hono/cors';

const app = new Hono<MyEnv>();
app.use(
  '*',
  cors({
    origin: 'http://localhost:3000', // 👈 your Next.js app
    credentials: true,               // 👈 allow cookies
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
)
app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/templates', templatesRoutes);
app.route('/uploads', uploadsRoutes);

app.onError(errorHandler);

export default app;
