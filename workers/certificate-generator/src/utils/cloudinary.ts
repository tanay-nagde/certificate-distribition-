import { v4 as uuidv4 } from 'uuid';
import type { MyEnv } from '@packages/types';

/**
 * Generates a SHA-1 signature required for secure Cloudinary uploads.
 * This must be done on the server-side (in the Worker).
 */
async function createCloudinarySignature(paramsToSign: string, apiSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(paramsToSign));
  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Uploads a file buffer to Cloudinary using a secure, signed upload.
 */
async function uploadToCloudinary(
  env: MyEnv['Bindings'],
  fileBuffer: ArrayBuffer,
  resourceType: 'image' | 'raw' = 'image'
): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000);
  const publicId = `certificates/${uuidv4()}`;

  // Parameters to be signed
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = await createCloudinarySignature(paramsToSign, env.CLOUDINARY_API_SECRET);

  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]));
  formData.append('api_key', env.CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('public_id', publicId);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = await response.json();
  return data.secure_url;
}


/**
 * Main function to upload both SVG and PDF artifacts to Cloudinary.
 */
export async function uploadArtifactsToCloudinary(
  env: MyEnv['Bindings'],
  artifacts: { svg: string; pdfBuffer: ArrayBuffer }
): Promise<{ svgUrl: string; pdfUrl: string }> {
  
  // Convert SVG string to Buffer for upload
  const svgBuffer = new TextEncoder().encode(artifacts.svg);

  const [svgUrl, pdfUrl] = await Promise.all([
    uploadToCloudinary(env, svgBuffer, 'image'),
    // For PDFs, Cloudinary often uses the 'raw' resource type, but 'image' can work if you want transformations.
    uploadToCloudinary(env, artifacts.pdfBuffer, 'raw') 
  ]);

  return { svgUrl, pdfUrl };
}
