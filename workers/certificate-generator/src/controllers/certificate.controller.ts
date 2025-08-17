import type { Context } from 'hono';
import type { MyEnv, QstashJobPayload } from '@packages/types'; // Assuming types are in a central file

// Import the refactored utility functions
import { getTemplateData, saveCertificate, updateJobProgress } from '../utils/db';
import { generateCertificateSvg, generateCertificatePdf } from '../utils/image';
import { uploadArtifactsToR2 } from '../utils/cloudinary';

// --- Main Controller Function ---

export const generateCertificateController = async (c: Context<MyEnv>) => {
  const payload = await c.req.json<QstashJobPayload>();
  const { jobId, templateId, record } = payload;

  try {
    // 1. Fetch template data from DB
    const templateData = await getTemplateData(c.env.DB, templateId);
    if (!templateData) {
      throw new Error(`Template with ID ${templateId} not found.`);
    }

    // 2. Generate the certificate SVG
    const svg = await generateCertificateSvg(templateData, record);

    // 3. Generate the certificate PDF from the SVG
    const pdfBuffer = await generateCertificatePdf(svg);

    // 4. Upload both files to R2
    const { svgUrl, pdfUrl } = await uploadArtifactsToR2(c.env.CERTIFICATE_BUCKET, { svg, pdfBuffer });

    // 5. Save the new certificate record to the database
    await saveCertificate(c.env.DB, { jobId, templateId, record, pdfUrl, svgUrl });

    // 6. Update the parent job's progress
    await updateJobProgress(c.env.DB, jobId, 'processed');

    return c.json({ success: true, message: 'Certificate generated and uploaded.' });

  } catch (error) {
    console.error('Failed to process certificate job:', error);
    // Ensure the job progress is updated even on failure
    await updateJobProgress(c.env.DB, jobId, 'failed');
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
};
