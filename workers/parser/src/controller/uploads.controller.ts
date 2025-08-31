import { uploadFileToCloudinary } from './../../../../packages/cloudinary/cloudinary';
import { v4 as uuidv4 } from 'uuid'
import { streamSSE } from 'hono/streaming'
import Papa from 'papaparse'
import { Client } from '@upstash/qstash'
import type { Context } from 'hono'
import type { MyEnv } from '@packages/types'



export const uploadCsv = async (c: Context<MyEnv>) => {
  const adminId = c.get('user')?.id
  if (!adminId) return c.json({ error: 'Unauthorized no admin id' }, 401)

  const templateId = c.req.query('template_id')
  if (!templateId) return c.json({ error: 'Template ID required' }, 400)

  // --- Parse CSV ---
  const formData = await c.req.formData()
  const file = formData.get('csv') as File
  if (!file) return c.json({ error: 'CSV file not provided' }, 400)

  const csvText = await file.text()
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter: ',',
    skipEmptyLines: true,
  })

  if (parsed.errors.length) {
    return c.json({ error: 'Invalid CSV', details: parsed.errors }, 400)
  }

  // --- Create Job ---
  const jobId = uuidv4()
try {
    await c.env.DB.prepare(
      `INSERT INTO upload_jobs (id, admin_id, template_id, status, total_records)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(jobId, adminId, templateId, 'pending', parsed.data.length).run()
  } catch (error) {
    console.error('Error creating job:', error)
    return c.json({ error: 'Failed to create job' }, 500)
  }

  // --- Fetch template + fields ---
  const templateDetails = await c.env.DB.prepare(
    `SELECT * FROM certificate_templates WHERE id = ?`
  ).bind(templateId).first()

  if (!templateDetails) {
    return c.json({ error: 'Template not found' }, 404)
  }

  const templateFields = await c.env.DB.prepare(
    `SELECT * FROM template_fields WHERE template_id = ?`
  ).bind(templateId).all()

  // --- Init QStash client ---
  const client = new Client({ 
    token: c.env.QSTASH_TOKEN,
    baseUrl: c.env.QSTASH_URL
  })

  // Prevent buffering
  c.header('Content-Encoding', 'Identity')

  return streamSSE(c, async (stream) => {
    let sent = 0

    try {
      // --- Build QStash messages ---
      const batchMessages = parsed.data.map((row, index) => {
        // precompute keys from CSV row for fast lookup
        const rowKeys = new Set(Object.keys(row))

        // only take fields that exist in both template and CSV row
        const fields = templateFields.results
          .filter((field: any) => rowKeys.has(field.field_key))
          .map((field: any) => ({
            key: field.field_key,
            value: row[field.field_key] ?? "",

            abs_x: (field.x / 100) * templateDetails.img_width,
            abs_y: (field.y / 100) * templateDetails.img_height,

            font: field.font,
            font_size: field.font_size,
            color: field.color,
            text_align: field.text_align
          }))

        return {
          url: "http://localhost:3003/generate", // consumer endpoint
          body: {
            job_id: jobId,
            template_id: templateId,
            admin_id: adminId,
            email: row.email,
            row_index: index,
            img_url: templateDetails.background_image_url,
            height: templateDetails.img_height,
            width: templateDetails.img_width,
            fields
          },
          flowControl: {
            key: `job-${jobId}`,
            parallelism: 10
          },
          retries: 3,
          timeout: 2,
          headers: {
            "Content-Type": "application/json",
            "X-Job-ID": jobId
          }
        }
      })

      // progress event before sending
      await stream.writeSSE({
        data: JSON.stringify({
          progress: 0,
          total: parsed.data.length,
          status: 'sending_to_qstash'
        })
      })

      // --- Batch send to QStash ---
      const responses = await client.batchJSON(batchMessages)
      sent = responses.length

      // progress update after sending
      await stream.writeSSE({
        data: JSON.stringify({
          progress: sent,
          total: parsed.data.length,
          status: 'sent_to_qstash'
        })
      })

      // mark job as processing
      await c.env.DB.prepare(
        `UPDATE upload_jobs SET status = ? WHERE id = ?`
      ).bind('processing', jobId).run()

      await stream.writeSSE({
        event: 'done',
        data: JSON.stringify({
          jobId,
          message: `${sent} messages sent to QStash for processing`
        })
      })

    } catch (error) {
      console.error('Error sending batch:', error)

      await c.env.DB.prepare(
        `UPDATE upload_jobs SET status = ? WHERE id = ?`
      ).bind('failed', jobId).run()

      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({
          message: 'Failed to send batch',
          error: (error as Error).message
        })
      })
    }
  })
}

// Simple callback to track failures in your consumer endpoint
export const handleProcessingResult = async (c: Context<MyEnv>) => {
  try {
    const { job_id, row_index, success, error } = await c.req.json()

    if (!success) {
      console.error(`Job ${job_id}, row ${row_index} failed:`, error)

      // You could update a specific row status in your DB here
      // e.g. await c.env.DB.prepare(`UPDATE some_table SET status = 'failed' WHERE job_id = ? AND row_index = ?`).bind(job_id, row_index).run()
    }
    
    // Always return a success response to QStash to prevent retries
    return c.json({ received: true })
  } catch (err) {
    console.error('Error handling processing result:', err);
    return c.json({ error: 'Failed to process result' }, 400);
  }
}


export const uploadimg = async (c: Context<MyEnv>) => {
try {
    const adminId = c.get('user')?.id
    if (!adminId) return { success: false, error: 'Unauthorized' }
  
    const formData = await c.req.formData()
    const file = formData.get('image') as File
    if (!file) return { success: false, error: 'Image file not provided' }

    const res = await uploadFileToCloudinary(c, file)
    return res.success ? { success: true, data: res.data } : { success: false, error: 'Upload failed' }
} catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
}
}

export const getAllUpload_jobs = async (c: Context<MyEnv>) => {
  const adminId = c.get('user')?.id
  if (!adminId) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const jobs = await c.env.DB.prepare(
    `SELECT * FROM upload_jobs WHERE admin_id = ?`
  ).bind(adminId).all()

  return c.json({ success: true, jobs })
}
