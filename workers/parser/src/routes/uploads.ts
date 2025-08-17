import { authMiddleware } from '@packages/middlewares/auth';
import { Hono } from 'hono';
import type { MyEnv } from '@packages/types';
import { uploadCsv, uploadimg } from '../controller/uploads.controller';

const uploadsRoutes = new Hono<MyEnv>();

uploadsRoutes.post('/upload-csv', authMiddleware , uploadCsv);
uploadsRoutes.post('/upload-image', authMiddleware, uploadimg);


//uploadsRoutes.get('/:id', });

export default uploadsRoutes;
