import 'server-only'; 

import { PDFProcessingError } from '../errors';

const API_BASE = 'https://api.cloudconvert.com/v2';
const API_KEY = process.env.CLOUDCONVERT_API_KEY;
const IS_SANDBOX = process.env.CLOUDCONVERT_SANDBOX === 'true';

function assertApiKey() {
  if (!API_KEY) {
    throw new PDFProcessingError(
      'CLOUDCONVERT_API_KEY belum diset di environment',
      'MISSING_API_KEY'
    );
  }
}

interface CCJob {
  id: string;
  status: 'waiting' | 'processing' | 'finished' | 'error';
  tasks: CCTask[];
}

interface CCTask {
  id: string;
  name: string;
  status: 'waiting' | 'processing' | 'finished' | 'error';
  result?: {
    form?: { url: string; parameters: Record<string, string> };
    files?: Array<{ filename: string; url: string }>;
  };
  message?: string;
}

export interface ConvertJobInput {
  input: {
    buffer: Uint8Array | Buffer;
    filename: string;
    mimeType?: string;
  };
  outputFormat: string;
  outputFilename?: string;
  options?: Record<string, unknown>;
  onProgress?: (pct: number, message?: string) => void;
}

export interface ConvertJobOutput {
  buffer: Uint8Array;
  filename: string;
  mimeType: string;
}

async function ccFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  assertApiKey();

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new PDFProcessingError(
      `CloudConvert ${res.status}: ${text.slice(0, 300)}`,
      'CC_HTTP_ERROR'
    );
  }

  return (await res.json()) as T;
}

export async function convertWithCloudConvert({
  input,
  outputFormat,
  outputFilename,
  options,
  onProgress,
}: ConvertJobInput): Promise<ConvertJobOutput> {
  assertApiKey();

  const filename = input.filename;
  const inputExt = extOf(filename);
  const finalOutputName =
    outputFilename ??
    filename.replace(/\.[^.]+$/, `.${outputFormat}`);

  // Sanitasi options agar tidak mengirim properti bernilai undefined/null/kosong
  const convertOptions: Record<string, unknown> = {};
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null && value !== '') {
        convertOptions[key] = value;
      }
    }
  }

  // Penanganan engine untuk mencegah error "Invalid engine"
  if (!convertOptions.engine) {
    if (IS_SANDBOX) {
      if (inputExt === 'pdf' && (outputFormat === 'docx' || outputFormat === 'doc')) {
        convertOptions.engine = 'pdf2docx';
      } else {
        convertOptions.engine = 'libreoffice';
      }
    }
  }

  const jobPayload = {
    tasks: {
      'import-file': {
        operation: 'import/upload',
      },
      'convert-file': {
        operation: 'convert',
        input: 'import-file',
        input_format: inputExt,
        output_format: outputFormat,
        ...convertOptions,
      },
      'export-file': {
        operation: 'export/url',
        input: 'convert-file',
        inline: false,
        archive_multiple_files: false,
      },
    },
    tag: `pdf-tools-${Date.now()}`,
  };

  const sandboxQuery = IS_SANDBOX ? '?sandbox=true' : '';
  const jobResponse = await ccFetch<{ data: CCJob }>(
    `/jobs${sandboxQuery}`,
    {
      method: 'POST',
      body: JSON.stringify(jobPayload),
    }
  );

  const job = jobResponse.data;
  onProgress?.(5, 'Job dibuat');

  const importTask = job.tasks.find((t) => t.name === 'import-file');
  if (!importTask?.result?.form) {
    throw new PDFProcessingError(
      'Task import tidak punya form upload',
      'CC_NO_UPLOAD_FORM'
    );
  }

  const form = importTask.result.form;
  const uploadForm = new FormData();
  for (const [k, v] of Object.entries(form.parameters)) {
    uploadForm.append(k, v);
  }
  uploadForm.append(
    'file',
    new Blob([input.buffer as BlobPart], {
      type: input.mimeType ?? 'application/octet-stream',
    }),
    filename
  );

  const uploadRes = await fetch(form.url, {
    method: 'POST',
    body: uploadForm,
  });

  if (!uploadRes.ok) {
    throw new PDFProcessingError(
      `Upload gagal: ${uploadRes.status}`,
      'CC_UPLOAD_FAILED'
    );
  }

  onProgress?.(15, 'File terupload');

  const finished = await pollJob(job.id, onProgress);

  const exportTask = finished.tasks.find((t) => t.name === 'export-file');
  const fileUrl = exportTask?.result?.files?.[0]?.url;

  if (!fileUrl) {
    throw new PDFProcessingError(
      'Tidak ada file hasil dari CloudConvert',
      'CC_NO_OUTPUT'
    );
  }

  const dlRes = await fetch(fileUrl);
  if (!dlRes.ok) {
    throw new PDFProcessingError(
      `Download hasil gagal: ${dlRes.status}`,
      'CC_DOWNLOAD_FAILED'
    );
  }

  const arrayBuf = await dlRes.arrayBuffer();
  const buffer = new Uint8Array(arrayBuf);

  onProgress?.(100, 'Selesai');

  return {
    buffer,
    filename: finalOutputName,
    mimeType: mimeOf(outputFormat),
  };
}

async function pollJob(
  jobId: string,
  onProgress?: (pct: number, msg?: string) => void,
  timeoutMs = 5 * 60 * 1000
): Promise<CCJob> {
  const start = Date.now();
  let interval = 1000;

  while (Date.now() - start < timeoutMs) {
    const res = await ccFetch<{ data: CCJob }>(`/jobs/${jobId}`);
    const job = res.data;

    const convertTask = job.tasks.find((t) => t.name === 'convert-file');
    if (convertTask?.status === 'processing') {
      onProgress?.(Math.min(80, 20 + Math.random() * 40), 'Mengkonversi...');
    }

    switch (job.status) {
      case 'finished': {
        const errTask = job.tasks.find((t) => t.status === 'error');
        if (errTask) {
          throw new PDFProcessingError(
            `Task gagal: ${errTask.message ?? 'unknown'}`,
            'CC_TASK_ERROR'
          );
        }
        onProgress?.(90, 'Menunggu hasil...');
        return job;
      }
      case 'error': {
        const errTask = job.tasks.find((t) => t.status === 'error');
        throw new PDFProcessingError(
          errTask?.message ?? 'CloudConvert job error',
          'CC_JOB_ERROR'
        );
      }
      case 'processing':
      case 'waiting':
      default:
        await sleep(interval);
        interval = Math.min(interval * 1.3, 4000);
    }
  }

  throw new PDFProcessingError(
    `CloudConvert timeout setelah ${timeoutMs / 1000}s`,
    'CC_TIMEOUT'
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extOf(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) {
    throw new PDFProcessingError('Nama file tanpa ekstensi', 'BAD_FILENAME');
  }
  return ext;
}

function mimeOf(format: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  return map[format] ?? 'application/octet-stream';
}