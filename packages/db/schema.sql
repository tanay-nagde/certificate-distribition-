-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  oauth_provider TEXT,
  oauth_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificate Templates
CREATE TABLE IF NOT EXISTS certificate_templates (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  background_image_url TEXT NOT NULL,
  img_height INTEGER NOT NULL,
  img_width INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Template Fields (dynamic text placement)
CREATE TABLE IF NOT EXISTS template_fields (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  field_key TEXT NOT NULL, -- e.g., "name", "date"
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  font TEXT NOT NULL DEFAULT 'Arial',
  text_align TEXT NOT NULL DEFAULT 'center',
  font_size INTEGER DEFAULT 24,
  color TEXT DEFAULT '#000000',
  FOREIGN KEY (template_id) REFERENCES certificate_templates(id) ON DELETE CASCADE
);

-- Upload Jobs (from CSV)
CREATE TABLE IF NOT EXISTS upload_jobs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'processing', 'done', 'failed'
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_records INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  FOREIGN KEY (admin_id) REFERENCES admins(id),
  FOREIGN KEY (template_id) REFERENCES certificate_templates(id)
);

-- Certificates generated
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  img_url TEXT UNIQUE NOT NULL,
  issued_by TEXT, -- added to fix missing FK
  status TEXT DEFAULT 'generated', -- 'pending', 'failed'
  generated_at TIMESTAMP,
  FOREIGN KEY (issued_by) REFERENCES admins(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES upload_jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES certificate_templates(id)
);

-- Certificate Field Values (to support dynamic text)
CREATE TABLE IF NOT EXISTS certificate_fields (
  id TEXT PRIMARY KEY,
  certificate_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_value TEXT NOT NULL,
  FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
);

-- Email log (sent per certificate)
CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  certificate_id TEXT NOT NULL,
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'sent', 'failed'
  error_message TEXT,
  FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
);
