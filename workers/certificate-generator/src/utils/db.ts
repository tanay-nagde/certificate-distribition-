import { v4 as uuidv4 } from 'uuid';
import type { D1Database } from '@cloudflare/workers-types';
import type { TemplateData } from '../types';

/**
 * Fetches template data from D1.
 */
export async function getTemplateData(db: D1Database, templateId: string): Promise<TemplateData | null> {
  const templateQuery = db.prepare(`SELECT background_image_url, font FROM certificate_templates WHERE id = ?`).bind(templateId);
  const fieldsQuery = db.prepare(`SELECT field_key, x, y, font_size, color FROM template_fields WHERE template_id = ?`).bind(templateId);
  const [templateResult, fieldsResult] = await db.batch([templateQuery, fieldsQuery]);
  const template = templateResult.results[0] as { background_image_url: string; font: string; };
  if (!template) return null;
  return { ...template, fields: fieldsResult.results as TemplateData['fields'] };
}

/**
 * Saves the certificate record to D1.
 */
export async function saveCertificate(db: D1Database, data: { jobId: string; templateId: string; record: Record<string, string>; pdfUrl: string; svgUrl: string }) {
  const certificateId = uuidv4();
  const qrSlug = uuidv4().slice(0, 12);
  const recipientEmail = data.record.email || 'N/A';
  const recipientName = data.record.name || 'N/A';

  const certificateInsert = db.prepare(
    `INSERT INTO certificates (id, job_id, template_id, recipient_email, recipient_name, qr_slug, pdf_url, status, generated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'generated', CURRENT_TIMESTAMP)`
  ).bind(certificateId, data.jobId, data.templateId, recipientEmail, recipientName, qrSlug, data.pdfUrl);

  const fieldInserts = Object.entries(data.record).map(([key, value]) => 
    db.prepare(`INSERT INTO certificate_fields (id, certificate_id, field_key, field_value) VALUES (?, ?, ?, ?)`).bind(uuidv4(), certificateId, key, value)
  );

  await db.batch([certificateInsert, ...fieldInserts]);
}

/**
 * Updates the progress of an upload job.
 */
export async function updateJobProgress(db: D1Database, jobId: string, status: 'processed' | 'failed') {
  const columnToUpdate = status === 'processed' ? 'processed_count' : 'failed_count';
  await db.prepare(`UPDATE upload_jobs SET ${columnToUpdate} = ${columnToUpdate} + 1 WHERE id = ?`).bind(jobId).run();
}
