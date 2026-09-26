// lib/processors/client/compress.ts
import { FileInput, ProcessOptions, ProcessResult, CompressionLevel } from "../types";
import { assert } from "../errors";
import { getGhostscript } from "./ghostscript-loader";

export async function compressPDF(
  files: FileInput[],
  options: ProcessOptions,
  onProgress?: (p: number) => void
): Promise<ProcessResult> {
  assert(files.length === 1, "Compress hanya 1 file");

  const originalSize = files[0].size;
  const level: CompressionLevel = options.compressionLevel ?? "recommended";
  const quality = getQualitySettings(level);

  onProgress?.(5);

  const gs = await getGhostscript();
  onProgress?.(20);

  const inputName = "input.pdf";
  const outputName = "output.pdf";

  const inputBytes =
    files[0].buffer instanceof Uint8Array
      ? files[0].buffer
      : new Uint8Array(files[0].buffer as ArrayBuffer);

  gs.FS.writeFile(inputName, inputBytes);
  onProgress?.(35);

  const args: string[] = [
    "-sDEVICE=pdfwrite",
    `-dCompatibilityLevel=${quality.compatibilityLevel}`,
    `-dPDFSETTINGS=/${quality.preset}`,

    "-dNOPAUSE",
    "-dBATCH",
    "-dQUIET",

    "-dDetectDuplicateImages=true",
    "-dCompressFonts=true",
    "-dSubsetFonts=true",
    "-dEmbedAllFonts=true",
    "-dAutoRotatePages=/None",

    "-dCompressPages=true",
    "-dUseFlateCompression=true",

    // Wajib: aktifkan encoding gambar untuk semua level
    "-dEncodeColorImages=true",
    "-dEncodeGrayImages=true",
    "-dEncodeMonoImages=true",
  ];

  if (quality.downsampleImages) {
    args.push(
      // Warna
      "-dDownsampleColorImages=true",
      "-dColorImageDownsampleType=/Bicubic",
      `-dColorImageResolution=${quality.colorImageResolution}`,
      "-dColorImageDownsampleThreshold=1.0",
      "-dAutoFilterColorImages=false",
      "-dColorImageFilter=/DCTEncode",

      // Grayscale
      "-dDownsampleGrayImages=true",
      "-dGrayImageDownsampleType=/Bicubic",
      `-dGrayImageResolution=${quality.grayImageResolution}`,
      "-dGrayImageDownsampleThreshold=1.0",
      "-dAutoFilterGrayImages=false",
      "-dGrayImageFilter=/DCTEncode",

      // Monokrom
      "-dDownsampleMonoImages=true",
      "-dMonoImageDownsampleType=/Subsample",
      `-dMonoImageResolution=${quality.monoImageResolution}`,
      "-dMonoImageDownsampleThreshold=1.0",
      "-dMonoImageFilter=/CCITTFaxEncode"
    );
  }

  // Mode extreme: paksa rasterisasi untuk PDF teks murni
  if (level === "extreme") {
    args.push(
      "-dColorImageDownsampleThreshold=1.0",
      "-dGrayImageDownsampleThreshold=1.0",
      "-dMonoImageDownsampleThreshold=1.0"
    );
  }

  args.push(`-dJPEGQ=${quality.jpegQuality}`);
  args.push(`-sOutputFile=${outputName}`, inputName);

  onProgress?.(50);

  let callError: unknown = null;
  try {
    gs.callMain(args);
  } catch (err) {
    callError = err;
  }

  let outputBytes: Uint8Array | null = null;
  try {
    outputBytes = gs.FS.readFile(outputName, { encoding: "binary" });
  } catch {
    outputBytes = null;
  }

  onProgress?.(85);

  try { gs.FS.unlink(inputName); } catch {}
  try { gs.FS.unlink(outputName); } catch {}

  if (callError || !outputBytes || outputBytes.byteLength === 0) {
    console.error("[compressPDF] Ghostscript gagal:", callError);
    const originalBuffer =
      files[0].buffer instanceof Uint8Array
        ? files[0].buffer
        : new Uint8Array(files[0].buffer as ArrayBuffer);

    return {
      files: [
        {
          buffer: originalBuffer,
          name: files[0].name.replace(/\.pdf$/i, "-compressed.pdf"),
          type: "application/pdf",
          size: originalBuffer.byteLength,
        },
      ],
      meta: {
        originalSize,
        compressedSize: originalBuffer.byteLength,
        ratio: "0.00%",
        warning: "Ghostscript gagal — file original dikembalikan.",
      },
    };
  }

  const compressed =
    outputBytes.byteLength < originalSize
      ? outputBytes
      : files[0].buffer instanceof Uint8Array
        ? files[0].buffer
        : new Uint8Array(files[0].buffer as ArrayBuffer);

  onProgress?.(100);

  const ratio =
    originalSize > 0
      ? ((1 - compressed.byteLength / originalSize) * 100).toFixed(2) + "%"
      : "0.00%";

  return {
    files: [
      {
        buffer: compressed,
        name: files[0].name.replace(/\.pdf$/i, "-compressed.pdf"),
        type: "application/pdf",
        size: compressed.byteLength,
      },
    ],
    meta: {
      originalSize,
      compressedSize: compressed.byteLength,
      ratio,
      level,
    },
  };
}

interface QualitySettings {
  preset: "screen" | "ebook" | "printer" | "prepress" | "default";
  compatibilityLevel: string;
  downsampleImages: boolean;
  colorImageResolution: number;
  grayImageResolution: number;
  monoImageResolution: number;
  jpegQuality: number;
}

function getQualitySettings(level: CompressionLevel): QualitySettings {
  switch (level) {
    case "extreme":
      return {
        preset: "screen",
        compatibilityLevel: "1.4",
        downsampleImages: true,
        colorImageResolution: 72,
        grayImageResolution: 72,
        monoImageResolution: 72,
        jpegQuality: 30,
      };
    case "low":
      return {
        preset: "prepress",
        compatibilityLevel: "1.7",
        downsampleImages: false,
        colorImageResolution: 300,
        grayImageResolution: 300,
        monoImageResolution: 1200,
        jpegQuality: 85,
      };
    case "recommended":
    default:
      return {
        preset: "ebook",
        compatibilityLevel: "1.5",
        downsampleImages: true,
        colorImageResolution: 120,
        grayImageResolution: 120,
        monoImageResolution: 300,
        jpegQuality: 60,
      };
  }
}