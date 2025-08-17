import { v4 as uuidv4 } from 'uuid'
import type { Context } from 'hono'
import type { MyEnv } from '@packages/types'
import { uploadimg } from './uploads.controller'

export const createTemplate = async (c: Context<MyEnv>) => {
  // Parse form-data instead of raw JSON
  const formData = await c.req.parseBody();

  // Extract "data" field (JSON string) and parse it
  const rawData = formData['data'];
  if (!rawData || typeof rawData !== 'string') {
    return c.json({ error: 'Missing or invalid data field' }, 400);
  }

  let body: {
    title: string;
    font?: string;
    fields: { field_key: string; x: number; y: number; font_size?: number; color?: string }[];
  };

  try {
    body = JSON.parse(rawData);
  } catch (err) {
    return c.json({ error: 'Invalid JSON in data field' }, 400);
  }

  const adminId = c.get('user')?.id;
  if (!adminId) return c.json({ error: 'Unauthorized' }, 401);

  const templateId = uuidv4();

  // --- Slug Generation ---
  const titleSlug = body.title
    .toLowerCase()
    .replace(/\s+/g, '-')         // spaces → hyphens
    .replace(/[^a-z0-9-]/g, '')   // remove invalid chars
    .slice(0, 50);

  const randomSuffix = uuidv4().slice(0, 8);
  const slug = `${titleSlug}-${randomSuffix}`;

  // Upload background image
  const { _data } = await uploadimg(c);
  const background_image_url =
    _data && _data.success && _data.data?.url ? _data.data.url : '';

  // Save template + fields
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO certificate_templates (id, admin_id, title, slug, background_image_url, font)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(templateId, adminId, body.title, slug, background_image_url, body.font ?? 'Poppins'),
    ...body.fields.map(f =>
      c.env.DB.prepare(
        `INSERT INTO template_fields (id, template_id, field_key, x, y, font_size, color)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(uuidv4(), templateId, f.field_key, f.x, f.y, f.font_size ?? 24, f.color ?? '#000000')
    )
  ]);

  return c.json({ success: true, template_id: templateId, slug });
};
