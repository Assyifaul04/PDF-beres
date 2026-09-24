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

/**
 * Fetch task dengan retry ringan.
 */
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
      if (res.status >= 400 && res.status < 500) return null; // client error → stop
    } catch {
      // network error → retry
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
}

/**
 * Report error ke server agar task ditandai FAILED.
 */
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
  // AUTO-TRIGGER (hanya sekali saat PENDING)
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

      // 1) Ambil signed URLs
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

      // 2) Download semua input
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

      // 3) Convert di browser
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

      // 4) Upload output
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

      // 5) Sync dari server
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

      // Kalau 409 (task sudah diproses), tetap polling
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
  // POLLING (server-only)
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
  const handleDownload = () => {
    window.location.href = `/api/tasks/${task.id}/download`;
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
  const outputCount = task.outputFiles.length;

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
        outputCount={outputCount}
        status={cardStatus}
        progress={clientProgress}
        statusLabel={clientMessage || "Memproses..."}
        onDownload={handleDownload}
        onRemove={handleRemove}
        onShowFiles={() => setShowFilesOpen(true)}
      />

      <ShowFilesDialog
        inputFiles={task.inputFiles}
        outputFiles={task.outputFiles}
        isCompleted={task.status === "COMPLETED"}
        open={showFilesOpen}
        onOpenChange={setShowFilesOpen}
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