import type { MyEnv } from '@packages/types';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

async function createCloudinarySignature(params: Record<string, string>, apiSecret: string): Promise<string> {
    // Sort params alphabetically and build string
    const sortedKeys = Object.keys(params).sort();
    const paramsString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');

    // Append API secret (Cloudinary style)
    const encoder = new TextEncoder();
    const data = encoder.encode(paramsString + apiSecret);

    // SHA-1 hash
    const digest = await crypto.subtle.digest('SHA-1', data);

    // Convert to hex
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

interface CloudinaryUploadResponse {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    original_filename: string;
}

interface CloudinaryErrorResponse {
    error: { message: string };
}

export const uploadFileToCloudinary = async (c: Context<MyEnv>, file: File) => {
    const cloudName = c.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = c.env.CLOUDINARY_API_KEY;
    const apiSecret = c.env.CLOUDINARY_API_SECRET;
    const uploadPreset = 'certificate-store';

    if (!cloudName || !apiKey || !apiSecret) {
        return c.json({ success: false, error: 'Cloudinary environment variables missing' }, 500);
    }

    if (!file) {
        return c.json({ success: false, error: 'File not found or invalid' }, 400);
    }

    try {
        const timestamp = Math.round(Date.now() / 1000).toString();

        // Only include params to be signed
        const paramsToSign = {
            timestamp,
            upload_preset: uploadPreset,
        };

        const signature = await createCloudinarySignature(paramsToSign, apiSecret);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
            method: 'POST',
            body: formData,
        });

        const json = await response.json();

        if (response.ok) {
            const result = json as CloudinaryUploadResponse;
            return c.json({ success: true, data: result, message: 'File uploaded successfully' });
        } else {
            const errorResult = json as CloudinaryErrorResponse;
            const errorMessage = errorResult?.error?.message || 'File upload failed';
            return c.json({ success: false, error: errorMessage }, response.status as ContentfulStatusCode);
        }
    } catch (error) {
        console.error('Internal server error during upload:', error);
        return c.json({ success: false, error: 'Internal server error' }, 500);
    }
};
