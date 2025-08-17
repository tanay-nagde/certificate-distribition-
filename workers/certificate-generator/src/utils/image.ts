import satori from 'satori';
import { html } from 'satori-html';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import type { TemplateData } from '../types';

/**
 * Generates an SVG for the certificate.
 */
export async function generateCertificateSvg(templateData: TemplateData, record: Record<string, string>): Promise<string> {
  const fontData = await fetch('https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff2').then(res => res.arrayBuffer());
  const markup = html`
    <div style="display: flex; position: relative; width: 1200px; height: 630px; font-family: '${templateData.font}';">
      <img src="${templateData.background_image_url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" />
      ${templateData.fields.map(field => `
        <div style="position: absolute; left: ${field.x}px; top: ${field.y}px; font-size: ${field.font_size}px; color: ${field.color};">
          ${record[field.field_key] || ''}
        </div>
      `).join('')}
    </div>
  `;
  return satori(markup, { width: 1200, height: 630, fonts: [{ name: templateData.font, data: fontData, weight: 400, style: 'normal' }] });
}

/**
 * Generates a PDF from an SVG string.
 */
export async function generateCertificatePdf(svg: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [1200, 630] });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
    SVGtoPDF(doc, svg, 0, 0);
    doc.end();
  });
}
