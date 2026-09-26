// components/process/pdf-preview.tsx
"use client";

import * as React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import { cn } from "@/lib/utils";

// ============================================================================
// WORKER INIT (sekali saja)
// ============================================================================

let workerInitialized = false;

if (typeof window !== "undefined" && !workerInitialized) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  workerInitialized = true;
}

// ============================================================================
// HELPERS — deteksi error abort secara menyeluruh
// ============================================================================

function isAbortError(err: any): boolean {
  if (!err) return false;

  const name = err?.name ?? "";
  const msg = String(err?.message ?? "").toLowerCase();

  return (
    name === "AbortError" ||
    name === "RenderingCancelledException" ||
    msg.includes("loading aborted") ||
    msg.includes("aborted") ||
    msg.includes("cancelled") ||
    msg.includes("destroyed") ||
    msg.includes("204") ||
    msg.includes("no content")
  );
}

// ============================================================================
// TYPES
// ============================================================================

interface PdfPreviewProps {
  url: string;
  rotation?: number;
  containerWidth?: number;
  className?: string;
  showPageCount?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PdfPreview({
  url,
  rotation = 0,
  containerWidth = 220,
  className,
  showPageCount = true,
}: PdfPreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [measuredWidth, setMeasuredWidth] = React.useState(containerWidth);

  // -------- Ukur lebar container sebenarnya --------
  React.useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const updateWidth = () => {
      const w = el.clientWidth;
      if (w > 0) setMeasuredWidth(w);
    };

    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // -------- Render halaman PDF --------
  React.useEffect(() => {
    let cancelled = false;
    let pdfDoc: any = null;
    let renderTask: any = null;

    async function renderPdfPage() {
      try {
        setLoading(true);
        setError(false);

        const loadingTask = pdfjs.getDocument({ url });
        pdfDoc = await loadingTask.promise;

        if (cancelled) {
          try { pdfDoc.destroy(); } catch {}
          return;
        }

        setNumPages(pdfDoc.numPages);

        const page = await pdfDoc.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // -------- Hitung scale berdasarkan lebar container --------
        const baseViewport = page.getViewport({ scale: 1.0 });
        const targetWidth = measuredWidth - 16;
        const scale = targetWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });

        // -------- Setup canvas dengan devicePixelRatio --------
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;

        renderTask = page.render({
          canvasContext: context,
          viewport,
          transform,
        });

        await renderTask.promise;

        if (!cancelled) setLoading(false);
      } catch (err: any) {
        // ⚠️ Abaikan SEMUA error abort — jangan log sama sekali
        if (isAbortError(err)) return;

        console.error("Gagal memuat preview PDF:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    if (url && measuredWidth > 0) {
      renderPdfPage();
    }

    return () => {
      cancelled = true;
      try { renderTask?.cancel(); } catch {}
      try { pdfDoc?.destroy(); } catch {}
    };
  }, [url, measuredWidth]);

  // ==========================================================================
  // ERROR STATE
  // ==========================================================================
  if (error) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 rounded-lg bg-muted/20 text-muted-foreground",
          className
        )}
      >
        <AlertTriangle className="h-8 w-8 text-red-500/70" />
        <span className="text-[10px] font-medium">Preview Gagal</span>
      </div>
    );
  }

  // ==========================================================================
  // NORMAL STATE
  // ==========================================================================
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full items-start justify-center overflow-hidden rounded-lg bg-background",
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="block rounded-sm shadow-sm transition-transform duration-300"
        style={{ transform: `rotate(${rotation}deg)` }}
      />

      {showPageCount && !loading && numPages && numPages > 1 && (
        <span className="absolute bottom-1.5 right-1.5 z-10 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-white">
          {numPages} hlm
        </span>
      )}
    </div>
  );
}