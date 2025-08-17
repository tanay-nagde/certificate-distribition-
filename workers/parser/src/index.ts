import { errorHandler } from '@packages/middlewares/error';
import type { MyEnv } from '@packages/types';

import { Hono } from 'hono';
import templatesRoutes from './routes/templates';
import uploadsRoutes from './routes/uploads';

const app = new Hono<MyEnv>();

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/templates', templatesRoutes);
app.route('/uploads', uploadsRoutes);

app.onError(errorHandler);

export default app;
