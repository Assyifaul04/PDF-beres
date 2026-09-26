// components/process/pdf-thumbnail.tsx
"use client";

import * as React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import * as pdfjs from "pdfjs-dist";

let workerInitialized = false;

if (typeof window !== "undefined" && !workerInitialized) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  workerInitialized = true;
}

interface PdfThumbnailProps {
  url: string;
  rotation?: number;
}

export function PdfThumbnail({ url, rotation = 0 }: PdfThumbnailProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [numPages, setNumPages] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let pdfDoc: any = null;
    let renderTask: any = null;

    async function renderPdfPage() {
      try {
        setLoading(true);
        setError(false);

        // ⚠️ Pakai `url` langsung — pdf.js yang handle fetch
        // Tidak ada AbortController yang bentrok dengan React Strict Mode
        const loadingTask = pdfjs.getDocument({
          url,
          withCredentials: false,
          // Cegah pdf.js abort kalau ada re-mount
          disableAutoFetch: false,
          disableStream: false,
        });

        pdfDoc = await loadingTask.promise;
        if (cancelled) {
          pdfDoc.destroy();
          return;
        }

        setNumPages(pdfDoc.numPages);

        const page = await pdfDoc.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: 0.5 });

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
        // Abaikan error abort (normal dari Strict Mode)
        if (
          err?.name === "AbortError" ||
          err?.name === "RenderingCancelledException" ||
          err?.message?.includes("Loading aborted")
        ) {
          return;
        }
        console.error("Gagal memuat preview PDF:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    if (url) {
      renderPdfPage();
    }

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
      if (pdfDoc) {
        try {
          pdfDoc.destroy();
        } catch {}
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-muted/20 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 text-red-500/70" />
        <span className="text-[10px] font-medium">Preview Gagal</span>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background p-1">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="max-h-full max-w-full rounded-sm object-contain shadow-sm transition-transform duration-300"
        style={{ transform: `rotate(${rotation}deg)` }}
      />

      {!loading && numPages && numPages > 1 && (
        <span className="absolute bottom-1 right-1 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white">
          {numPages} hlm
        </span>
      )}
    </div>
  );
}