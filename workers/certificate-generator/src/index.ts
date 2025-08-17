import { Hono } from 'hono';
import type { MyEnv } from '@packages/types'; // Assuming types are in a central file
import certificateRoutes from './routes/certificateRoutes';
import { errorHandler } from '@packages/middlewares/error'; // Assuming a central error handler

const app = new Hono<MyEnv>();

// Register the certificate generation routes
// app.route('/generate', certificateRoutes);

// Optional: Add a health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

// Register a global error handler
app.onError(errorHandler);

export default app;
