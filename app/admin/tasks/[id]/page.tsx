// app/admin/tasks/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskFilesList } from "@/components/admin/tasks/task-files-list";
import { TaskSettingsView } from "@/components/admin/tasks/task-settings-view";
import { TaskErrorView } from "@/components/admin/tasks/task-error-view";
import { TasksRowActions } from "@/components/admin/tasks/tasks-row-actions";
import { getToolTypeLabel } from "@/lib/queries/tasks";
import { ArrowLeftIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const task = await prisma.documentTask.findUnique({
    where: { id },
    select: { toolType: true },
  });
  return {
    title: task
      ? `${getToolTypeLabel(task.toolType)} — Task Detail`
      : "Task Detail | Admin",
  };
}

export default async function TaskDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const task = await prisma.documentTask.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      inputFiles: {
        include: {
          file: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
      outputFiles: {
        include: {
          file: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!task) notFound();

  const duration =
    task.completedAt && task.createdAt
      ? Math.round(
          (new Date(task.completedAt).getTime() -
            new Date(task.createdAt).getTime()) /
            1000
        )
      : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild={false}>
            <Link href="/admin/tasks">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {getToolTypeLabel(task.toolType)}
              </h1>
              <Badge
                variant={
                  task.status === "COMPLETED"
                    ? "default"
                    : task.status === "FAILED"
                      ? "destructive"
                      : "outline"
                }
              >
                {task.status}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              ID: {task.id}
            </p>
          </div>
        </div>
        <TasksRowActions id={task.id} status={task.status} />
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
          </CardHeader>
          <CardContent>
            {task.user ? (
              <>
                <p className="font-medium">{task.user.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {task.user.email}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Anonymous</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dibuat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {new Date(task.createdAt).toLocaleString("id-ID")}
            </p>
            {task.completedAt && (
              <p className="text-xs text-muted-foreground">
                Selesai: {new Date(task.completedAt).toLocaleString("id-ID")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Durasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {duration !== null ? `${duration} detik` : "—"}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {task.status === "PROCESSING" ? "Masih berjalan" : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {task.errorMessage && <TaskErrorView message={task.errorMessage} />}

      {/* Settings */}
      {task.settings && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskSettingsView settings={task.settings} />
          </CardContent>
        </Card>
      )}

      {/* Input Files */}
      <Card>
        <CardHeader>
          <CardTitle>Input Files ({task.inputFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskFilesList files={task.inputFiles.map((f) => f.file)} />
        </CardContent>
      </Card>

      {/* Output Files */}
      <Card>
        <CardHeader>
          <CardTitle>Output Files ({task.outputFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskFilesList
            files={task.outputFiles.map((f) => f.file)}
            emptyMessage="Belum ada output"
          />
        </CardContent>
      </Card>
    </div>
  );
}