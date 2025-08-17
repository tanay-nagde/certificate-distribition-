import { D1Database, R2Bucket } from '@cloudflare/workers-types';
// Database Table Types
export enum oauth_providers{
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  CUSTOM = 'custom'
}

export type Admin = {
  id: string
  name: string
  email: string
  password_hash?: string
  oauth_provider?: string
  oauth_id?: string
  created_at: string
}

export type CertificateTemplate = {
  id: string
  admin_id: string
  title: string
  slug: string
  background_image_url: string
  font: string
  created_at: string
}

export type TemplateField = {
  id: string
  template_id: string
  field_key: string
  x: number
  y: number
  font_size: number
  color: string
}

export type UploadJob = {
  id: string
  admin_id: string
  template_id: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  uploaded_at: string
  total_records: number
  processed_count: number
  failed_count: number
}

export type Certificate = {
  id: string
  job_id: string
  template_id: string
  recipient_email: string
  recipient_name: string
  qr_slug: string
  pdf_url?: string
  status: 'generated' | 'pending' | 'failed'
  generated_at?: string
}

export type CertificateField = {
  id: string
  certificate_id: string
  field_key: string
  field_value: string
}

export type EmailLog = {
  id: string
  certificate_id: string
  sent_at?: string
  status: 'pending' | 'sent' | 'failed'
  error_message?: string
}

// Global Hono Environment Type

export type MyEnv = {
  Bindings: {
    DB: D1Database
    JWT: string // secret or jwt
    QSTASH_TOKEN: string;
    QSTASH_NEXT_SIGNING_KEY: string;
    CLOUDINARY_API_KEY : string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
  }
  Variables: {
    user?: {
      id: string
      email: string
      name?: string
    }
  }
}
export type QstashJobPayload = {
  /** The unique ID of the parent upload job. */
  jobId: string;
  /** The unique ID of the certificate template to use. */
  templateId: string;
  /** * A key-value object representing a single row from the uploaded CSV.
   * e.g., { name: 'John Doe', email: 'john@example.com', course: 'Intro to AI' }
   */
  record: Record<string, string>;
};

/**
 * Defines the structure for the data fetched from the database
 * for a specific certificate template.
 */
export type TemplateData = {
  /** The URL of the background image for the certificate. */
  background_image_url: string;
  /** The name of the font to be used (e.g., 'Poppins'). */
  font: string;
  /** An array of field definitions that specify where to place text. */
  fields: {
    /** The key that maps to a column in the CSV record (e.g., "name", "date"). */
    field_key: string;
    /** The horizontal position (in pixels) from the left edge. */
    x: number;
    /** The vertical position (in pixels) from the top edge. */
    y: number;
    /** The font size for this field. */
    font_size: number;
    /** The color of the text for this field (hex code). */
    color: string;
  }[];
};