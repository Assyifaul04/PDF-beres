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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true },
  });

  return {
    title: user
      ? `${user.name ?? user.email} | Admin`
      : "User Tidak Ditemukan | Admin",
  };
}

export default async function UserDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      plan: true,
      usedBytes: true,
      taskCount: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          files: true,
          tasks: true,
          sessions: true,
          accounts: true,
        },
      },
      files: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          originalName: true,
          sizeBytes: true,
          storageProvider: true,
          migrationStatus: true,
          createdAt: true,
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          toolType: true,
          status: true,
          createdAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back Button */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali ke Users
        </Link>
      </div>

      {/* Header Profile */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="text-xl">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {user.name ?? "Tanpa Nama"}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex gap-2">
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role}
            </Badge>
            <Badge variant={user.plan === "PREMIUM" ? "default" : "outline"}>
              {user.plan}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Terpakai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(Number(user.usedBytes))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.taskCount.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user._count.files.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user._count.sessions.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <InfoRow label="User ID" value={user.id} mono />
          <InfoRow label="Email" value={user.email ?? "-"} />
          <InfoRow
            label="Email Verified"
            value={
              user.emailVerified
                ? new Date(user.emailVerified).toLocaleDateString("id-ID")
                : "Belum diverifikasi"
            }
          />
          <InfoRow label="Role" value={user.role} />
          <InfoRow label="Plan" value={user.plan} />
          <InfoRow label="Total Accounts" value={String(user._count.accounts)} />
          <InfoRow
            label="Bergabung"
            value={new Date(user.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
          <InfoRow
            label="Update Terakhir"
            value={new Date(user.updatedAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
        </CardContent>
      </Card>

      {/* Recent Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>File Terbaru</CardTitle>
          <Button variant="ghost" size="sm" disabled>
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          {user.files.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada file
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama File</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {file.originalName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{file.storageProvider}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {file.migrationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatBytes(Number(file.sizeBytes))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(file.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Task Terbaru</CardTitle>
          <Button variant="ghost" size="sm" disabled>
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          {user.tasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada task
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Selesai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.toolType}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.status === "COMPLETED"
                            ? "default"
                            : task.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.completedAt
                        ? new Date(task.completedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}