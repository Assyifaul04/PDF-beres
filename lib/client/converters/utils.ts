// lib/client/converters/utils.ts
export interface ConvertInput {
  name: string;
  buffer: ArrayBuffer;
}

export interface ConvertOutput {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

export type ProgressCallback = (pct: number, message: string) => void;

/**
 * Trigger download dari Blob.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert Blob → ArrayBuffer.
 */
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer();
}

/**
 * Clone target HTML ke iframe terisolasi (anti CSS leak).
 */
export async function renderHtmlInIframe(
  html: string,
  width = 794
): Promise<{ iframe: HTMLIFrameElement; doc: Document }> {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: ${width}px; height: 1123px;
    border: none; background: white;
  `;
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body {
        padding: 40px 60px; color: #000;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt; line-height: 1.6;
      }
      h1 { font-size: 24pt; font-weight: bold; margin: 16pt 0 8pt; }
      h2 { font-size: 18pt; font-weight: bold; margin: 14pt 0 8pt; }
      h3 { font-size: 14pt; font-weight: bold; margin: 12pt 0 6pt; }
      p { margin: 8pt 0; }
      ul, ol { margin: 8pt 0; padding-left: 24pt; }
      table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
      th, td { border: 1px solid #ccc; padding: 6pt; text-align: left; }
      th { background: #f5f5f5; font-weight: bold; }
      img { max-width: 100%; height: auto; }
    </style></head><body>${html}</body></html>
  `);
  doc.close();
  await new Promise((r) => setTimeout(r, 300));
  return { iframe, doc };
}

/**
 * Sanitize CSS di cloned doc untuk html2canvas.
 */
export function sanitizeClone(clonedDoc: Document) {
  const style = clonedDoc.createElement("style");
  style.textContent = `
    * { color: #000 !important; background-color: transparent !important; border-color: #ccc !important; }
    body { background-color: #fff !important; }
    th { background-color: #f5f5f5 !important; }
  `;
  clonedDoc.head.appendChild(style);
}

/**
 * Convert angka jadi "1.5 MB".
 */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}