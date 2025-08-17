import { Hono } from 'hono';
import type { MyEnv } from '@packages/types';
import { createTemplate } from '../controller/templates.controller';
import { authMiddleware } from '@packages/middlewares/auth';

const templatesRoutes = new Hono<MyEnv>();

// templatesRoutes.get('/', (c) => {
//   return c.json([
//     { id: 1, name: 'Welcome Email', content: '<h1>Welcome</h1>' },
//     { id: 2, name: 'Password Reset', content: '<h1>Reset Your Password</h1>' }
//   ]);
// });

templatesRoutes.post('/create-template', authMiddleware, createTemplate);

export default templatesRoutes;
