import { MyEnv, QstashJobPayload } from "@packages/types"
import { Receiver } from "@upstash/qstash"
import type { Context } from "hono"

type QstashMessageBody = {
  job_id: string;
  template_id: string;
  admin_id: string;
  email: string;
  row_index: number;
  row: Record<string, string>;
};

export const generateCertificate = async (c: Context<MyEnv>) => {
  const receiver = new Receiver({
  currentSigningKey: c.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: c.env.QSTASH_NEXT_SIGNING_KEY,
})
  const body = await c.req.text()
  const signature = c.req.header("Upstash-Signature")!


    try {
      // Verify the incoming request
      await receiver.verify({ signature, body });

      // If verification is successful, process the message
      const payload = JSON.parse(body) as QstashMessageBody;
      console.log("Received a valid QStash message:", payload);

      return c.json({ message: "Certificate generation started" }, { status: 202 });
    } catch (error) {
      // If verification fails, return an error response
      return c.json({ error: "Invalid signature" }, { status: 401 });
    }

  // Process the certificate generation
}
