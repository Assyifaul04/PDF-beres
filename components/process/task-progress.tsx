// components/process/task-progress.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TaskProgressCard } from "@/components/process/task-progress-card";
import { ShowFilesDialog } from "@/components/process/show-files-dialog";
import {
  convertClientSide,
  isClientTool,
  type ConverterInput,
} from "@/lib/client/converters";

// ============================================================================
// TYPES
// ============================================================================

type TaskStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
type CardStatus = "pending" | "processing" | "completed" | "failed";

interface InputFileInfo {
  fileId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  expiresAt?: string;
  order: number;
}

interface OutputFileInfo {
  fileId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  expiresAt?: string;
}

interface TaskData {
  id: string;
  toolType: string;
  status: TaskStatus;
  errorMessage: string | null;
  settings: unknown;
  createdAt: string;
  updatedAt?: string;
  completedAt: string | null;
  userId: string | null;
  inputFiles: InputFileInfo[];
  outputFiles: OutputFileInfo[];
}

interface Props {
  initialTask: TaskData;
  toolTitle: string;
  slug: string;
  categoryLabel?: string;
}

// ============================================================================
// SAVINGS TOOLS — Tool yang menampilkan grafik "SAVED"
// ============================================================================

const SAVINGS_TOOLS = new Set<string>([
  "COMPRESS_PDF",         // Kompresi → ukuran turun
  "PDF_TO_JPG",           // PDF → JPG biasanya lebih kecil
  "PDF_TO_WORD",          // PDF → Word biasanya lebih kecil
  "PDF_TO_POWERPOINT",    // PDF → PPT biasanya lebih kecil
  "PDF_TO_EXCEL",         // PDF → Excel biasanya lebih kecil
]);

function shouldShowSavings(toolType: string): boolean {
  return SAVINGS_TOOLS.has(toolType);
}

function getSavingsLabels(toolType: string): {
  title: string;
  description: string;
} {
  switch (toolType) {
    case "COMPRESS_PDF":
      return {
        title: "File berhasil dikompres!",
        description: "Menghemat",
      };
    case "PDF_TO_JPG":
      return {
        title: "PDF berhasil dikonversi ke gambar!",
        description: "Ukuran turun",
      };
    case "PDF_TO_WORD":
      return {
        title: "PDF berhasil dikonversi ke Word!",
        description: "Ukuran turun",
      };
    case "PDF_TO_POWERPOINT":
      return {
        title: "PDF berhasil dikonversi ke PowerPoint!",
        description: "Ukuran turun",
      };
    case "PDF_TO_EXCEL":
      return {
        title: "PDF berhasil dikonversi ke Excel!",
        description: "Ukuran turun",
      };
    default:
      return {
        title: "File berhasil diproses!",
        description: "Menghemat",
      };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function mapStatusToCard(status: TaskStatus): CardStatus {
  switch (status) {
    case "PENDING":
      return "pending";
    case "PROCESSING":
      return "processing";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
  }
}

async function fetchTask(
  taskId: string,
  retries = 2
): Promise<Partial<TaskData> | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return (json.data ?? json) as Partial<TaskData>;
      }
      if (res.status >= 400 && res.status < 500) return null;
    } catch {
      // network error
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
}

async function reportError(taskId: string, message: string): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("error", message);
    const res = await fetch(`/api/tasks/${taskId}/complete`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      console.warn("[task-progress] reportError failed:", res.status);
    }
  } catch (e) {
    console.warn("[task-progress] reportError exception:", e);
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TaskProgress({
  initialTask,
  toolTitle,
  slug,
  categoryLabel,
}: Props) {
  const router = useRouter();

  const [task, setTask] = React.useState<TaskData>(initialTask);
  const [clientProgress, setClientProgress] = React.useState(0);
  const [clientMessage, setClientMessage] = React.useState("");
  const [showFilesOpen, setShowFilesOpen] = React.useState(false);

  const hasTriggered = React.useRef(false);

  const runsOnClient = isClientTool(task.toolType);

  // ==========================================================================
  // AUTO-TRIGGER
  // ==========================================================================
  React.useEffect(() => {
    if (hasTriggered.current) return;
    if (task.status !== "PENDING") return;

    hasTriggered.current = true;

    if (runsOnClient) {
      void runClientProcessing();
    } else {
      void runServerProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, task.status, runsOnClient]);

  // ==========================================================================
  // CLIENT-SIDE PROCESSING
  // ==========================================================================
  async function runClientProcessing() {
    try {
      setTask((prev) => ({ ...prev, status: "PROCESSING" }));
      setClientProgress(2);
      setClientMessage("Mempersiapkan file...");

      const dataRes = await fetch(`/api/tasks/${task.id}/data`, {
        cache: "no-store",
      });
      if (!dataRes.ok) throw new Error(`Gagal ambil data (${dataRes.status})`);
      const dataJson = await dataRes.json();
      if (!dataJson.success) {
        throw new Error(dataJson.error ?? "Gagal ambil data");
      }

      const inputsFromApi: { name: string; url: string }[] =
        dataJson.data?.inputFiles ?? [];
      if (!inputsFromApi.length) throw new Error("Tidak ada file input");

      setClientProgress(5);
      setClientMessage("Mendownload file...");

      const inputs: ConverterInput[] = await Promise.all(
        inputsFromApi.map(async (f) => {
          const res = await fetch(f.url);
          if (!res.ok) throw new Error(`Gagal download ${f.name}`);
          const buffer = await res.arrayBuffer();
          return { name: f.name, buffer };
        })
      );

      setClientProgress(20);
      setClientMessage("Mengkonversi...");

      const output = await convertClientSide(
        task.toolType,
        inputs,
        (task.settings as Record<string, unknown> | null) ?? null,
        (pct, msg) => {
          const mapped = 20 + Math.round((pct / 100) * 60);
          setClientProgress(mapped);
          if (msg) setClientMessage(msg);
        }
      );

      setClientProgress(85);
      setClientMessage("Mengunggah hasil...");

      const formData = new FormData();
      formData.append("output", output.blob, output.fileName);
      formData.append("mimeType", output.mimeType);

      const completeRes = await fetch(`/api/tasks/${task.id}/complete`, {
        method: "POST",
        body: formData,
      });
      const completeJson = await completeRes.json();
      if (!completeRes.ok || !completeJson.success) {
        throw new Error(completeJson.error ?? "Gagal upload hasil");
      }

      setClientProgress(100);
      setClientMessage("Selesai!");

      const fresh = await fetchTask(task.id);
      setTask((prev) => ({
        ...prev,
        ...(fresh ?? {}),
        status: "COMPLETED",
        completedAt: fresh?.completedAt ?? new Date().toISOString(),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      await reportError(task.id, message);
      setTask((prev) => ({ ...prev, status: "FAILED", errorMessage: message }));
    }
  }

  // ==========================================================================
  // SERVER-SIDE PROCESSING
  // ==========================================================================
  async function runServerProcessing() {
    try {
      setTask((prev) => ({ ...prev, status: "PROCESSING" }));
      setClientMessage("Memproses di server...");
      setClientProgress(10);

      const res = await fetch(`/api/tasks/${task.id}/process-server`, {
        method: "POST",
      });
      const json = await res.json();

      if (res.status === 409) {
        setClientMessage("Menunggu server...");
        setClientProgress(30);
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Server processing gagal");
      }

      setClientMessage("Menunggu server...");
      setClientProgress(30);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setTask((prev) => ({ ...prev, status: "FAILED", errorMessage: message }));
    }
  }

  // ==========================================================================
  // POLLING
  // ==========================================================================
  React.useEffect(() => {
    if (runsOnClient) return;
    if (task.status === "COMPLETED" || task.status === "FAILED") return;

    let cancelled = false;
    const interval = setInterval(async () => {
      const fresh = await fetchTask(task.id);
      if (cancelled || !fresh) return;
      setTask((prev) => ({
        ...prev,
        ...fresh,
        status: (fresh.status as TaskStatus) ?? prev.status,
      }));
      if (fresh.status === "PROCESSING") {
        setClientProgress((p) => Math.min(p + 5, 90));
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [task.id, task.status, runsOnClient]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleDownload = async () => {
    if (task.outputFiles.length <= 1) {
      const link = document.createElement("a");
      link.href = `/api/tasks/${task.id}/download`;
      link.download = task.outputFiles[0]?.originalName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      try {
        const res = await fetch(`/api/tasks/${task.id}/download`);
        const json = await res.json();
        if (json.success && json.data?.files) {
          json.data.files.forEach((f: { url: string; name: string }) => {
            if (f.url) {
              const link = document.createElement("a");
              link.href = f.url;
              link.download = f.name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          });
        }
      } catch (err) {
        console.error("[download] error:", err);
      }
    }
  };

  const handleRemove = () => {
    router.push(slug ? `/${slug}` : "/");
  };

  // ==========================================================================
  // DERIVED
  // ==========================================================================
  const cardStatus: CardStatus = mapStatusToCard(task.status);

  const inputFileName = task.inputFiles[0]?.originalName ?? "file";
  const inputFileSize = Number(task.inputFiles[0]?.sizeBytes ?? 0);
  const outputFileName = task.outputFiles[0]?.originalName;
  const outputFileSize = Number(task.outputFiles[0]?.sizeBytes ?? 0);
  const outputCount = task.outputFiles.length;

  // Tentukan apakah tool ini menampilkan savings
  const showSavings = shouldShowSavings(task.toolType);
  const savingsLabels = getSavingsLabels(task.toolType);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {categoryLabel && (
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {categoryLabel}
        </h2>
      )}

      <TaskProgressCard
        inputFileName={inputFileName}
        inputFileSize={inputFileSize}
        outputFileName={outputFileName}
        outputFileSize={outputFileSize}
        outputCount={outputCount}
        status={cardStatus}
        progress={clientProgress}
        statusLabel={clientMessage || "Memproses..."}
        onDownload={handleDownload}
        onRemove={handleRemove}
        onShowFiles={() => setShowFilesOpen(true)}
        showSavings={showSavings}
        savingsTitle={savingsLabels.title}
        savingsDescription={savingsLabels.description}
      />

      <ShowFilesDialog
        inputFiles={task.inputFiles}
        outputFiles={task.outputFiles}
        isCompleted={task.status === "COMPLETED"}
        open={showFilesOpen}
        onOpenChange={setShowFilesOpen}
        showSavings={showSavings}
      />

      {task.status === "FAILED" && task.errorMessage && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Detail Error</p>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-destructive/90">
            {task.errorMessage}
          </pre>
        </div>
      )}
    </div>
  );
}