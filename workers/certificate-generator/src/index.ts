import { uploadimg } from './../../parser/src/controller/uploads.controller';
import { Hono } from 'hono';
import type { MyEnv } from '@packages/types'; // Assuming types are in a central file
import certificateRoutes from './routes/certificateRoutes';
import { errorHandler } from '@packages/middlewares/error'; // Assuming a central error handler
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
// Register the certificate generation routes
app.route('/', certificateRoutes);


// Optional: Add a health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

// Register a global error handler
app.onError(errorHandler);

export default app;
