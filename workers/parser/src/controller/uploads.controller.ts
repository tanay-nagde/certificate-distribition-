import { uploadFileToCloudinary } from './../../../../packages/cloudinary/cloudinary';
import { v4 as uuidv4 } from 'uuid'
import { streamSSE } from 'hono/streaming'
import Papa from 'papaparse'
import { Client } from '@upstash/qstash'
import type { Context } from 'hono'
import type { MyEnv } from '@packages/types'

// The uploadCsv function
export const uploadCsv = async (c: Context<MyEnv>) => {
  const adminId = c.get('user')?.id
  if (!adminId) return c.json({ error: 'Unauthorized no admin id' }, 401)

  const templateId = c.req.query('template_id')
  if (!templateId) return c.json({ error: 'Template ID required' }, 400)

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

  const jobId = uuidv4()
  await c.env.DB.prepare(
    `INSERT INTO upload_jobs (id, admin_id, template_id, status, total_records)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(jobId, adminId, templateId, 'pending', parsed.data.length).run()

  // Initialize QStash client with explicit baseUrl for local dev
  const client = new Client({ 
    token: c.env.QSTASH_TOKEN,
    baseUrl: c.env.QSTASH_URL // Use the URL from your .dev.vars
  });

  // Hono header to prevent buffering
  c.header('Content-Encoding', 'Identity')

  // Return a streaming response to the client
  return streamSSE(c, async (stream) => {
    let sent = 0

    try {
      // Create all messages for batch sending - NO LOOPS!
      const batchMessages = parsed.data.map((row, index) => ({
        // Use the consumer endpoint URL from environment variables
        url: "http://localhost:3003/generate",
        body: {
          job_id: jobId,
          template_id: templateId,
          admin_id: adminId,
          email: row.email,
          row_index: index,
          row
        },
        flowControl: {
          key: `job-${jobId}`,   // All messages share same flow control
          parallelism: 10       // Only 10 concurrent executions
        },
        retries: 3,             // Retry failed messages
        timeout: 2,          // 5 minute timeout
        headers: {
          "Content-Type": "application/json",
          "X-Job-ID": jobId
        }
      }))

      // Send a single progress update immediately before the batch call
      await stream.writeSSE({
        data: JSON.stringify({
          progress: 0,
          total: parsed.data.length,
          status: 'sending_to_qstash',
          
        })
      })

      // Single batch call - send all messages at once
      const responses = await client.batchJSON(batchMessages)
      sent = responses.length

      // After the batch call completes, send the final status update
      await stream.writeSSE({
        data: JSON.stringify({
          progress: sent,
          total: parsed.data.length,
          status: 'sent_to_qstash'
        })
      })

      // Update job status in DB
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

      // Update job to failed in DB
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
