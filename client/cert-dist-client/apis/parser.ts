import { Textbox } from 'fabric';
import axios from "axios";

const LOCAL_PARSER_URL = "http://localhost:3002";

const api = axios.create({
  baseURL: LOCAL_PARSER_URL, // your hono backend
  withCredentials: true,            // 👈 VERY important
});

export async function generateCert(
  file: File | null,
  templateId: string,
  onMessage: (data: any) => void,
) {
  if (!file) {
    throw new Error("No file provided");
  }

  const formData = new FormData();
  formData.append("csv", file);

  // ✅ call backend and stream the response
  const response = await fetch(
    `${LOCAL_PARSER_URL}/uploads/upload-csv?template_id=${templateId}`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok || !response.body) {
    throw new Error("Failed to generate certificate");
  }

  // Parse SSE stream manually
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split SSE messages
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const line = part
        .split("\n")
        .find((l) => l.startsWith("data:"));

      if (line) {
        try {
          const json = JSON.parse(line.replace("data: ", ""));
          onMessage(json);
        } catch (err) {
          console.error("Invalid SSE message", line);
        }
      }
    }
  }
}

export const getTemplates = async () => {
  try {
    const response = await api.get("/templates/my-templates");
    return response.data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};
export interface FieldPosition {
  id: string
  name: string
  relativeX: number
  relativeY: number

}

export interface UploadPayload {
  title: string

  fields: {
    field_key: string
    x: number
    y: number
    font_size: number
    color: string
    font:string
    text_align:"left" | "center" | "right"
  }[]
}

export const uploadTemp = async (file: File | null, payload: UploadPayload) => {

  console.log("called")
  if (!file) throw new Error("No file provided")

  const formData = new FormData()
  formData.append("image", file) // image file
  formData.append("data", JSON.stringify(payload)) // 👈 must be "data" to match controller

console.log("api-1")
  const response = await api.post("/templates/create-template", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
console.log("api-2")
  return response.data

}

export const getAllUploadJobs = async () => {
  try {
    const response = await api.get("/uploads/upload-jobs");
    return response.data;
  } catch (error) {
    console.error("Error fetching upload jobs:", error);
    throw error;
  }
};
