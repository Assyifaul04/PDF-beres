// lib/processors/server/pdf-security.ts
import 'server-only';

import { PDFDocument } from 'pdf-lib';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink, mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type {
  FileInput,
  ProcessOptions,
  ProcessResult,
  ProgressFn,
} from '../types';
import { PDFProcessingError } from '../errors';

const execFileAsync = promisify(execFile);

// ============================================================================
// CONFIG
// ============================================================================

const QPDF_BIN = process.env.QPDF_BIN || 'qpdf';

// ============================================================================
// TYPES
// ============================================================================

interface ProtectPermissions {
  printing?: 'highResolution' | 'lowResolution' | 'none';
  modifying?: boolean;
  copying?: boolean;
  annotating?: boolean;
  fillingForms?: boolean;
  contentAccessibility?: boolean;
  documentAssembly?: boolean;
}

interface ProtectOptions extends ProcessOptions {
  password?: string;
  permissions?: ProtectPermissions;
}

interface UnlockOptions extends ProcessOptions {
  password?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function toBuffer(input: FileInput['buffer']): Buffer {
  if (input instanceof Uint8Array) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }
  return Buffer.from(input);
}

function assertSinglePdf(files: FileInput[], toolLabel: string): FileInput {
  if (files.length !== 1) {
    throw new PDFProcessingError(
      `${toolLabel} hanya menerima 1 file`,
      'SINGLE_FILE_ONLY'
    );
  }
  const f = files[0];
  if (!f.buffer || f.size === 0) {
    throw new PDFProcessingError(
      `File "${f.name}" kosong atau tidak valid`,
      'EMPTY_FILE'
    );
  }
  return f;
}

// ============================================================================
// PROTECT_PDF
// ============================================================================

export async function protectPDF(
  files: FileInput[],
  options: ProtectOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  const f = assertSinglePdf(files, 'Protect');

  if (!options.password || options.password.length < 4) {
    throw new PDFProcessingError(
      'Password minimal 4 karakter',
      'INVALID_PASSWORD'
    );
  }

  const dir = await mkdtemp(join(tmpdir(), 'protect-'));
  const inputPath = join(dir, 'input.pdf');
  const outputPath = join(dir, 'output.pdf');

  try {
    onProgress?.(10, 'Menyiapkan enkripsi...');
    await writeFile(inputPath, toBuffer(f.buffer));

    const perms = options.permissions ?? {};
    const printMode =
      perms.printing === 'none'
        ? 'none'
        : perms.printing === 'lowResolution'
          ? 'low'
          : 'full';

    const args = [
      '--encrypt',
      options.password,
      options.password,
      '256',
      '--',
      `--print=${printMode}`,
      `--modify=${perms.modifying ? 'all' : 'none'}`,
      `--extract=${perms.copying ? 'y' : 'n'}`,
      `--annotate=${perms.annotating ? 'y' : 'n'}`,
      inputPath,
      outputPath,
    ];

    onProgress?.(40, 'Mengenkripsi PDF...');
    await execFileAsync(QPDF_BIN, args, { timeout: 60_000 });

    onProgress?.(85, 'Menyimpan hasil...');
    const outBuf = await readFile(outputPath);
    const buf = new Uint8Array(outBuf);
    onProgress?.(100, 'Selesai');

    return {
      files: [
        {
          buffer: buf,
          name: f.name.replace(/\.pdf$/i, '-protected.pdf'),
          type: 'application/pdf',
          size: buf.byteLength,
        },
      ],
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    throw new PDFProcessingError(
      `Protect gagal: ${message}`,
      'PROTECT_FAILED'
    );
  } finally {
    await Promise.allSettled([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
  }
}

// ============================================================================
// UNLOCK_PDF
// ============================================================================

export async function unlockPDF(
  files: FileInput[],
  options: UnlockOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  const f = assertSinglePdf(files, 'Unlock');

  if (!options.password) {
    throw new PDFProcessingError('Password wajib diisi', 'NO_PASSWORD');
  }

  const dir = await mkdtemp(join(tmpdir(), 'unlock-'));
  const inputPath = join(dir, 'input.pdf');
  const outputPath = join(dir, 'output.pdf');

  try {
    onProgress?.(10, 'Menyiapkan dekripsi...');
    await writeFile(inputPath, toBuffer(f.buffer));

    const args = [
      `--password=${options.password}`,
      '--decrypt',
      inputPath,
      outputPath,
    ];

    onProgress?.(40, 'Membuka kunci PDF...');
    await execFileAsync(QPDF_BIN, args, { timeout: 60_000 });

    onProgress?.(85, 'Menyimpan hasil...');
    const outBuf = await readFile(outputPath);
    const buf = new Uint8Array(outBuf);
    onProgress?.(100, 'Selesai');

    return {
      files: [
        {
          buffer: buf,
          name: f.name.replace(/\.pdf$/i, '-unlocked.pdf'),
          type: 'application/pdf',
          size: buf.byteLength,
        },
      ],
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    throw new PDFProcessingError(
      `Unlock gagal (password salah atau file corrupt): ${message}`,
      'UNLOCK_FAILED'
    );
  } finally {
    await Promise.allSettled([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
  }
}

// ============================================================================
// REPAIR_PDF
// ============================================================================

export async function repairPDF(
  files: FileInput[],
  _options: ProcessOptions,
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  const f = assertSinglePdf(files, 'Repair');

  // ---------- Tier 1: pdf-lib rebuild ----------
  try {
    onProgress?.(10, 'Membaca PDF...');
    const doc = await PDFDocument.load(
      f.buffer instanceof Uint8Array ? f.buffer : new Uint8Array(f.buffer),
      {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
      }
    );

    onProgress?.(40, 'Membangun ulang struktur...');
    const fresh = await PDFDocument.create();
    const indices = doc.getPageIndices();
    const copied = await fresh.copyPages(doc, indices);
    copied.forEach((p) => fresh.addPage(p));
    fresh.setProducer('PDF Tools Repair');
    fresh.setCreationDate(new Date());

    onProgress?.(90, 'Menyimpan hasil...');
    const bytes = await fresh.save({ useObjectStreams: true });
    const buf = new Uint8Array(bytes);
    onProgress?.(100, 'Selesai');

    return {
      files: [
        {
          buffer: buf,
          name: f.name.replace(/\.pdf$/i, '-repaired.pdf'),
          type: 'application/pdf',
          size: buf.byteLength,
        },
      ],
      meta: { pages: fresh.getPageCount(), repaired: true, method: 'pdf-lib' },
    };
  } catch {
    // ---------- Tier 2: qpdf recovery ----------
    onProgress?.(30, 'Mencoba recovery dengan qpdf...');

    const dir = await mkdtemp(join(tmpdir(), 'repair-'));
    const inputPath = join(dir, 'input.pdf');
    const outputPath = join(dir, 'output.pdf');

    try {
      await writeFile(inputPath, toBuffer(f.buffer));
      await execFileAsync(QPDF_BIN, [inputPath, outputPath], {
        timeout: 60_000,
      });
      const outBuf = await readFile(outputPath);
      const buf = new Uint8Array(outBuf);
      onProgress?.(100, 'Selesai');

      return {
        files: [
          {
            buffer: buf,
            name: f.name.replace(/\.pdf$/i, '-repaired.pdf'),
            type: 'application/pdf',
            size: buf.byteLength,
          },
        ],
        meta: { repaired: true, method: 'qpdf' },
      };
    } catch (qpdfErr: unknown) {
      const message =
        qpdfErr instanceof Error ? qpdfErr.message : 'Unknown error';
      throw new PDFProcessingError(
        `PDF tidak dapat direpair: ${message}`,
        'REPAIR_FAILED'
      );
    } finally {
      await Promise.allSettled([
        unlink(inputPath).catch(() => {}),
        unlink(outputPath).catch(() => {}),
      ]);
    }
  }
}