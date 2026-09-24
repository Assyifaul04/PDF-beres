import 'server-only';

import { PDFProcessingError } from '../errors';

const ILOVEPDF_PUBLIC_KEY = process.env.ILOVEPDF_PUBLIC_KEY;

// ============================================================================
// TYPES
// ============================================================================

export type ILovePDFTaskType =
  | 'officepdf'
  | 'pdfword'
  | 'pdfpowerpoint'
  | 'pdfexcel';

export interface ILovePDFConvertInput {
  input: {
    buffer: Uint8Array | Buffer;
    filename: string;
  };
  taskType: ILovePDFTaskType;
  outputFormat: string;
  onProgress?: (pct: number, message?: string) => void;
}

export interface ConvertJobOutput {
  buffer: Uint8Array;
  filename: string;
  mimeType: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function toUint8(input: Uint8Array | Buffer): Uint8Array {
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
}

function mimeOf(format: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return map[format] ?? 'application/octet-stream';
}

// ============================================================================
// AUTH
// ============================================================================

async function getAuthToken(): Promise<string> {
  if (!ILOVEPDF_PUBLIC_KEY) {
    throw new PDFProcessingError(
      'ILOVEPDF_PUBLIC_KEY tidak diset di .env',
      'MISSING_API_KEY'
    );
  }

  const res = await fetch('https://api.ilovepdf.com/v1/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: ILOVEPDF_PUBLIC_KEY }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new PDFProcessingError(
      `iLovePDF auth gagal: ${res.status} — ${text.slice(0, 200)}`,
      'ILOVEPDF_AUTH_FAILED'
    );
  }

  const { token } = await res.json();
  if (!token) {
    throw new PDFProcessingError(
      'Response auth tidak mengandung token',
      'ILOVEPDF_NO_TOKEN'
    );
  }
  return token;
}

// ============================================================================
// MAIN CONVERTER
// ============================================================================

export async function convertWithILovePDF({
  input,
  taskType,
  outputFormat,
  onProgress,
}: ILovePDFConvertInput): Promise<ConvertJobOutput> {
  // ---------- 1. Auth ----------
  onProgress?.(10, 'Autentikasi dengan iLovePDF...');
  const token = await getAuthToken();
  const authHeader = { Authorization: `Bearer ${token}` };

  // ---------- 2. Start task ----------
  onProgress?.(20, `Memulai task ${taskType}...`);
  const startRes = await fetch(
    `https://api.ilovepdf.com/v1/start/${taskType}`,
    { headers: authHeader }
  );

  if (!startRes.ok) {
    const text = await startRes.text().catch(() => '');
    if (text.includes('The requested tool does not exist')) {
      throw new PDFProcessingError(
        `Tool '${taskType}' tidak didukung atau tidak aktif pada akun iLovePDF Anda.`,
        'ILOVEPDF_TOOL_NOT_SUPPORTED'
      );
    }
    throw new PDFProcessingError(
      `Start task gagal: ${startRes.status} — ${text.slice(0, 300)}`,
      'ILOVEPDF_START_FAILED'
    );
  }

  const startJson = await startRes.json();
  const { server, task } = startJson;

  if (!server || !task) {
    throw new PDFProcessingError(
      `Response start task tidak valid: ${JSON.stringify(startJson).slice(0, 200)}`,
      'ILOVEPDF_INVALID_START'
    );
  }

  const serverUrl = `https://${server}/v1`;

  // ---------- 3. Upload ----------
  onProgress?.(35, 'Mengunggah file...');

  const buffer = toUint8(input.buffer);
  const blob = new Blob([buffer as BlobPart]);

  const uploadForm = new FormData();
  uploadForm.append('task', task);
  uploadForm.append('file', blob, input.filename);

  const uploadRes = await fetch(`${serverUrl}/upload`, {
    method: 'POST',
    headers: authHeader,
    body: uploadForm,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '');
    throw new PDFProcessingError(
      `Upload gagal: ${uploadRes.status} — ${text.slice(0, 300)}`,
      'ILOVEPDF_UPLOAD_FAILED'
    );
  }

  const uploadJson = await uploadRes.json();
  const serverFilename = uploadJson.server_filename;

  if (!serverFilename) {
    throw new PDFProcessingError(
      `Response upload tidak mengandung server_filename: ${JSON.stringify(uploadJson).slice(0, 200)}`,
      'ILOVEPDF_NO_SERVER_FILENAME'
    );
  }

  // ---------- 4. Process ----------
  onProgress?.(60, 'Mengkonversi...');

  const processBody = {
    task,
    files: [
      {
        server_filename: serverFilename,
        filename: input.filename,
      },
    ],
  };

  const processRes = await fetch(`${serverUrl}/process`, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(processBody),
  });

  if (!processRes.ok) {
    const text = await processRes.text().catch(() => '');
    throw new PDFProcessingError(
      `Process gagal: ${processRes.status} — ${text.slice(0, 300)}`,
      'ILOVEPDF_PROCESS_FAILED'
    );
  }

  // ---------- 5. Download ----------
  onProgress?.(85, 'Mengunduh hasil...');
  const dlRes = await fetch(`${serverUrl}/download/${task}`, {
    headers: authHeader,
  });

  if (!dlRes.ok) {
    throw new PDFProcessingError(
      `Download gagal: ${dlRes.status}`,
      'ILOVEPDF_DOWNLOAD_FAILED'
    );
  }

  const arrayBuf = await dlRes.arrayBuffer();
  const resultBuffer = new Uint8Array(arrayBuf);

  onProgress?.(100, 'Selesai');

  return {
    buffer: resultBuffer,
    filename: input.filename.replace(/\.[^.]+$/, `.${outputFormat}`),
    mimeType: mimeOf(outputFormat),
  };
}