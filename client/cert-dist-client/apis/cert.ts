import axios from "axios";

const LOCAL_AUTH_URL = "http://localhost:3003"; // adjust if deployed

const api = axios.create({
  baseURL: LOCAL_AUTH_URL, // your hono backend
  withCredentials: true,   // important if you’re using cookies
});

// TypeScript type for Certificate row (matching your D1 schema)
export interface Certificate {
  id: string;
  job_id: string;
  template_id: string;
  recipient_email: string;
  recipient_name: string;
  slug: string;
  img_url: string;
  issued_by?: string | null;
  status: "generated" | "pending" | "failed";
  generated_at?: string | null; // ISO timestamp
}

// ✅ Fetch all certificates for a given job
export async function getCertificatesByJobId(jobId: string): Promise<Certificate[]> {
  try {
    const response = await api.get(`/certificates/job/${jobId}`);
    return response.data as Certificate[];
  } catch (error) {
    console.error("Error fetching certificates by job:", error);
    throw error;
  }
}

// ✅ Fetch a single certificate by slug
export async function getCertificateBySlug(slug: string): Promise<Certificate | null> {
  try {
    const response = await api.get(`/certificates/slug/${slug}`);
    return response.data as Certificate;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; // not found
    }
    console.error("Error fetching certificate by slug:", error);
    throw error;
  }
}
