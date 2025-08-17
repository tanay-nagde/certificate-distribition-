import { uploadFileToCloudinary } from '@packages/cloudinary/cloudinary'
import { v4 as uuidv4 } from 'uuid'
import { streamSSE } from 'hono/streaming'
import Papa from 'papaparse'
import type { Context } from 'hono'
import type { MyEnv } from '@packages/types'

const QSTASH_URL = 'https://qstash.upstash.io/v1/publish'

export const uploadCsv = async (c: Context<MyEnv>) => {
  const QSTASH_TOKEN = c.env.QSTASH_TOKEN
  const adminId = c.get('user')?.id
  if (!adminId) return c.json({ error: 'Unauthorized' }, 401)

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

  // optional fix for Cloudflare wrangler quirks
  c.header('Content-Encoding', 'Identity')

  return streamSSE(
    c,
    async (stream) => {
      let sent = 0

      // handle aborted connection
      stream.onAbort(() => {
        console.log(`SSE aborted: job ${jobId}`)
      })

      for (const row of parsed.data) {
        // publish each row
        await fetch(`${QSTASH_URL}/https://your-worker-url/consumer-endpoint`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${QSTASH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_id: jobId,
            template_id: templateId,
            admin_id: adminId,
            TemplateId : templateId,
            row,
          }),
        })

        sent++
        await stream.writeSSE({
          data: JSON.stringify({ progress: sent, total: parsed.data.length }),
        })
      }

      await c.env.DB.prepare(
        `UPDATE upload_jobs SET status = ? WHERE id = ?`
      ).bind('completed', jobId).run()

      await stream.writeSSE({ event: 'done', data: '{}' })
    },
    // ✅ error handler
    async (err, stream) => {
      console.error('Error while streaming SSE:', err)
      await stream.writeSSE({ event: 'error', data: JSON.stringify({ message: 'Streaming failed' }) })
    }
  )
}


export const uploadimg = async (c: Context<MyEnv>) => {
  const adminId = c.get('user')?.id
  if (!adminId) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const formData = await c.req.formData()
  const file = formData.get('image') as File
  if (!file) return c.json({ success: false, error: 'Image file not provided' }, 400)

  return uploadFileToCloudinary(c, file)
}
