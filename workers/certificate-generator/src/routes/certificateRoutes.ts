import { Hono } from 'hono';
import { verifySignature } from '@upstash/qstash/hono';
import { generateCertificateController } from '../controllers/certificateController';
import type { MyEnv } from "@packages/types"; // Assuming types are in a central file

const certificateRoutes = new Hono<MyEnv>();

// Apply Qstash signature verification to all routes in this file
certificateRoutes.use('*', verifySignature({
  currentSigningKey: (c) => c.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: (c) => c.env.QSTASH_NEXT_SIGNING_KEY,
}));

// Define the POST route for the generation job
certificateRoutes.post('/', generateCertificateController);

export default certificateRoutes;
