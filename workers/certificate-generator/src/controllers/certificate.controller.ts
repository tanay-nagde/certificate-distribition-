import { uploadFileToCloudinary } from "@packages/cloudinary/cloudinary";
import { MyEnv } from "@packages/types";
import { Receiver } from "@upstash/qstash";
import type { Context } from "hono";
import { ImageResponse } from "workers-og";

// --- Types ---
type QstashMessageBody = {
  job_id: string;
  template_id: string;
  admin_id: string;
  row_index: number;
  img_url: string;
  height: number;
  width: number;
  fields: {
    key: string;
    value: string;
    abs_x: number;
    abs_y: number;
    font: string;
    font_size: number;
    color: string;
    text_align: "left" | "center" | "right";
  }[];
};

// --- Helpers ---
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Generate Certificate ---
export const generateCertificate = async (c: Context<MyEnv>) => {
  const receiver = new Receiver({
    currentSigningKey: c.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: c.env.QSTASH_NEXT_SIGNING_KEY,
  });

  const body = await c.req.text();
  const signature = c.req.header("Upstash-Signature")!;

  try {
    // Verify QStash signature
    await receiver.verify({ signature, body });
    const payload = JSON.parse(body) as QstashMessageBody;
    console.log("Received a valid QStash message:", payload);

    // Build dynamic HTML
    const fieldsHtml = payload.fields
      .map(
        (field) => `
        <p style="
          position: absolute;
          top: ${field.abs_y}px;
          left: ${field.abs_x}px;
          margin: 0;
          font-family: ${field.font}, sans-serif;
          font-size: ${field.font_size}px;
          color: ${field.color};
          text-align: ${field.text_align};
          line-height: 1;
        ">
          ${field.value}
        </p>
      `
      )
      .join("\n");

    const html = `
      <div style="
        display: flex;
        width: 100%;
        height: 100%;
        background-image: url('${payload.img_url}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        font-family: sans-serif;
        overflow: hidden;
      ">
        <div style="position: relative; display:flex; width: 100%; height: 100%;">
          ${fieldsHtml}
        </div>
      </div>
    `;

    // Generate PNG
    const img = new ImageResponse(html, {
      width: payload.width,
      height: payload.height,
    });
    const arrayBuffer = await img.arrayBuffer();

    // Convert → base64 → Cloudinary
    const base64 = arrayBufferToBase64(arrayBuffer);
    const dataUri = `data:image/png;base64,${base64}`;
    const res = await uploadFileToCloudinary(c, dataUri);

    if (!res.success) {
      throw new Error("Failed to upload image", { cause: res.error });
    }

    const url = res.data.url;
    console.log("✅ Uploaded to Cloudinary:", url);

    // Insert into D1
    const id = crypto.randomUUID();
    const slug = crypto.randomUUID(); // or slugify(name + job_id)
    const now = new Date().toISOString();
    const recipientName =
      payload.fields.find((f) => f.key === "Name")?.value || "Unknown";

    await c.env.DB.prepare(
      `INSERT INTO certificates (
        id, job_id, template_id, recipient_email, recipient_name,
        slug, img_url, issued_by, status, generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        payload.job_id,
        payload.template_id,
        "test@example.com", // TODO: replace with real email (from your CSV/row data)
        recipientName,
        slug,
        url,
        payload.admin_id,
        "generated",
        now
      )
      .run();

    return c.json({ success: true, url, slug, id });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Certificate generation failed" }, { status: 500 });
  }
};

// --- Get certificates by Job ID ---
export const getCertificatesByJobId = async (c: Context<MyEnv>) => {
  const jobId = c.req.param("job_id");

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM certificates WHERE job_id = ?"
  )
    .bind(jobId)
    .all();

  if (!results || results.length === 0) {
    return c.json({ success: false, error: "No certificates found" }, 404);
  }

  return c.json({ success: true, certificates: results });
};

// --- Get certificate by Slug (public page) ---
export const getCertificateBySlug = async (c: Context<MyEnv>) => {
  const slug = c.req.param("slug");

  const cert = await c.env.DB.prepare(
    "SELECT * FROM certificates WHERE slug = ?"
  )
    .bind(slug)
    .first();

  if (!cert) {
    return c.json({ success: false, error: "Certificate not found" }, 404);
  }

  return c.json({ success: true, certificate: cert });
};

// --- Routes (in your main.ts/app.ts) ---
// app.post("/generate", generateCertificate);
