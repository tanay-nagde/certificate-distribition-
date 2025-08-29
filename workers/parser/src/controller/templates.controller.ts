import { v4 as uuidv4 } from 'uuid'
import type { Context } from 'hono'
import type { MyEnv } from '@packages/types'
import { uploadimg } from './uploads.controller'

export const createTemplate = async (c: Context<MyEnv>) => {
  const formData = await c.req.parseBody();

  const rawData = formData['data'];
  if (!rawData || typeof rawData !== 'string') {
    return c.json({ error: 'Missing or invalid data field' }, 400);
  }

  let body: {
    title: string;
    fields: { field_key: string; x: number; y: number; font_size?: number; color?: string; font: string; text_align: string }[];
  };

  try {
    body = JSON.parse(rawData);
  } catch {
    return c.json({ error: 'Invalid JSON in data field' }, 400);
  }

  const adminId = c.get('user')?.id;
  if (!adminId) return c.json({ error: 'Unauthorized' }, 401);

  const templateId = uuidv4();

  // Slug generation
  const titleSlug = body.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50);

  const randomSuffix = uuidv4().slice(0, 8);
  const slug = `${titleSlug}-${randomSuffix}`;

  //tets
  


  // Upload background image
  const response = await uploadimg(c);
  const background_image_url = response.data ? response.data.url : '';
  const height = response.data ? response.data.height : 0;
  const width = response.data ? response.data.width : 0;

  // --- Transaction ---
  // Insert certificate_templates
await c.env.DB.prepare(`
  INSERT INTO certificate_templates
  (id, admin_id, title, slug, background_image_url, img_height, img_width)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)
.bind(templateId, adminId, body.title, slug, background_image_url, height, width)
.run();

// Insert each field
for (const f of body.fields) {
  await c.env.DB.prepare(`
    INSERT INTO template_fields
    (id, template_id, field_key, x, y, font_size, color, font, text_align)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  .bind(
    uuidv4(), templateId, f.field_key,
    f.x, f.y,
    f.font_size ?? 24,
    f.color ?? '#000000',
    f.font ?? 'Poppins',
    f.text_align ?? 'center'
  )
  .run();
}


  return c.json({ success: true, template_id: templateId, slug, background_image_url, height, width });
};



export const getTemplatesByAdmin = async (c: Context<MyEnv>) => {
  const adminId = c.get('user')?.id
  if (!adminId) return c.json({ error: 'Unauthorized' }, 401)

  try {
    // Fetch templates created by this admin
    const { results: templates } = await c.env.DB.prepare(
      `SELECT 
         id, 
         title, 
         slug, 
         background_image_url, 
         created_at
       FROM certificate_templates 
       WHERE admin_id = ?1
       ORDER BY created_at DESC`
    ).bind(adminId).all()

    return c.json({ success: true, templates })
  } catch (err) {
    console.error("Error fetching templates:", err)
    return c.json({ error: 'Failed to fetch templates' }, 500)
  }
}