// components/process/task-progress.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TaskProgressCard } from "@/components/process/task-progress-card";
import { ShowFilesDialog } from "@/components/process/show-files-dialog";
import { convertClientSide } from "@/lib/client/converters";

// ============================================================================
// TYPES
// ============================================================================

type TaskStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

interface InputFileInfo {
  fileId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  order: number;
}

interface OutputFileInfo {
  fileId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
}

interface TaskData {
  id: string;
  toolType: string;
  status: TaskStatus;
  errorMessage: string | null;
  settings: unknown;
  createdAt: string;
  completedAt: string | null;
  userId: string | null;
  inputFiles: InputFileInfo[];
  outputFiles: OutputFileInfo[];
}

interface Props {
  initialTask: TaskData;
  toolTitle: string;
  slug: string;
  /** Label heading di atas card, misal "HASIL KONVERSI" */
  categoryLabel?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SERVER_ONLY_TOOLS = new Set(["POWERPOINT_TO_PDF"]);

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
  const [mode, setMode] = React.useState<"client" | "server">("client");
  const [showFilesOpen, setShowFilesOpen] = React.useState(false);
  const hasTriggered = React.useRef(false);

  // ==========================================================================
  // AUTO-TRIGGER CLIENT PROCESSING
  // ==========================================================================
  React.useEffect(() => {
    if (hasTriggered.current) return;
    if (task.status !== "PENDING") return;
    if (mode !== "client") return;

    hasTriggered.current = true;
    runClientProcessing();
  }, [task.id, task.status, mode]);

  // ==========================================================================
  // CLIENT-SIDE PROCESSING
  // ==========================================================================
  async function runClientProcessing() {
    try {
      if (SERVER_ONLY_TOOLS.has(task.toolType)) {
        setClientMessage("Tool ini diproses di server...");
        await runServerProcessing();
        return;
      }

      setTask((prev) => ({ ...prev, status: "PROCESSING" }));
      setClientMessage("Mempersiapkan file...");
      setClientProgress(2);

      // 1. Fetch signed URLs
      const dataRes = await fetch(`/api/tasks/${task.id}/data`);
      const dataJson = await dataRes.json();
      if (!dataJson.success) {
        throw new Error(dataJson.error ?? "Gagal fetch data");
      }

      const { inputFiles } = dataJson.data;

      setClientProgress(5);
      setClientMessage("Mendownload file...");

      // 2. Download semua input
      const inputs = await Promise.all(
        inputFiles.map(async (f: { name: string; url: string }) => {
          const res = await fetch(f.url);
          if (!res.ok) throw new Error(`Gagal download ${f.name}`);
          const buffer = await res.arrayBuffer();
          return { name: f.name, buffer };
        })
      );

      setClientProgress(20);
      setClientMessage("Mengkonversi...");

      // 3. Convert di client
      const output = await convertClientSide(
        task.toolType,
        inputs,
        task.settings as Record<string, unknown> | null,
        (pct, msg) => {
          const mapped = 20 + Math.round((pct / 100) * 60);
          setClientProgress(mapped);
          setClientMessage(msg);
        }
      );

      setClientProgress(85);
      setClientMessage("Menyelesaikan Unggahan");

      // 4. Upload output
      const formData = new FormData();
      formData.append("output", output.blob, output.fileName);

      const completeRes = await fetch(`/api/tasks/${task.id}/complete`, {
        method: "POST",
        body: formData,
      });
      const completeJson = await completeRes.json();
      if (!completeJson.success) {
        throw new Error(completeJson.error ?? "Gagal upload hasil");
      }

      setClientProgress(100);
      setClientMessage("Selesai!");

      setTask((prev) => ({
        ...prev,
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      const formData = new FormData();
      formData.append("error", message);
      await fetch(`/api/tasks/${task.id}/complete`, {
        method: "POST",
        body: formData,
      }).catch(() => null);

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
      if (!json.success) {
        throw new Error(json.error ?? "Server processing gagal");
      }

      setClientProgress(90);
      setClientMessage("Hampir selesai...");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setTask((prev) => ({ ...prev, status: "FAILED", errorMessage: message }));
    }
  }

  // ==========================================================================
  // POLLING — server-side only
  // ==========================================================================
  React.useEffect(() => {
    if (task.status === "COMPLETED" || task.status === "FAILED") return;
    if (mode === "client" && !SERVER_ONLY_TOOLS.has(task.toolType)) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data ?? json;
        setTask((prev) => ({
          ...prev,
          status: data.status,
          errorMessage: data.errorMessage,
          completedAt: data.completedAt,
          outputFiles: data.outputFiles ?? prev.outputFiles,
        }));
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [task.id, task.status, mode]);

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
  // DERIVED DATA
  // ==========================================================================
  const cardStatus: "processing" | "completed" | "failed" =
    task.status === "PROCESSING" || task.status === "PENDING"
      ? "processing"
      : task.status === "COMPLETED"
        ? "completed"
        : "failed";

  const inputFileName = task.inputFiles[0]?.originalName ?? "file";
  const inputFileSize = Number(task.inputFiles[0]?.sizeBytes ?? 0);
  const outputFileName = task.outputFiles[0]?.originalName;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Heading */}
      {categoryLabel && (
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {categoryLabel}
        </h2>
      )}

      {/* Progress Card */}
      <TaskProgressCard
        inputFileName={inputFileName}
        inputFileSize={inputFileSize}
        outputFileName={outputFileName}
        status={cardStatus}
        progress={clientProgress}
        statusLabel={clientMessage || "Memproses..."}
        onDownload={handleDownload}
        onRemove={handleRemove}
        onShowFiles={() => setShowFilesOpen(true)}
      />

      {/* ✅ Modal "Tampilkan Files" — controlled, tanpa trigger */}
      <ShowFilesDialog
        inputFiles={task.inputFiles}
        outputFiles={task.outputFiles}
        isCompleted={task.status === "COMPLETED"}
        open={showFilesOpen}
        onOpenChange={setShowFilesOpen}
      />

      {/* Error box */}
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