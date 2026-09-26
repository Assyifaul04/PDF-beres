// app/admin/dashboard/page.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Folder,
  ListChecks,
  Database,
  LayoutGrid,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  FileText,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"

// ==============================================================================
// TYPES
// ==============================================================================

type DashboardData = {
  totalUsers: number
  totalAdmins: number
  totalPremiumUsers: number
  totalFreeUsers: number

  totalFiles: number
  supabaseFiles: number
  driveFiles: number
  totalSizeBytes: string
  expiredFiles: number
  tempFiles: number
  processingMigration: number
  completedMigration: number
  failedMigration: number

  totalTasks: number
  pendingTasks: number
  processingTasks: number
  completedTasks: number
  failedTasks: number

  totalCategories: number
  totalMenus: number
  activeMenus: number

  totalLogs: number
  errorLogs: number

  recentUsers: Array<{
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string
    plan: string
    createdAt: string
  }>
  recentTasks: Array<{
    id: string
    toolType: string
    status: string
    errorMessage: string | null
    createdAt: string
    user: { name: string | null; email: string | null; image: string | null } | null
  }>
  recentLogs: Array<{
    id: string
    level: string
    action: string
    message: string
    createdAt: string
  }>
  chartData: Array<{
    date: string
    users: number
    files: number
    tasks: number
  }>
}

// ==============================================================================
// HELPERS
// ==============================================================================

function formatBytes(bytesStr: string): string {
  const num = Number(bytesStr)
  if (num === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(num) / Math.log(k))
  return `${(num / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function statusBadge(status: string) {
  const map: Record<
    string,
    {
      label: string
      variant: "default" | "secondary" | "destructive" | "outline"
      icon: React.ReactNode
    }
  > = {
    PENDING: { label: "Pending", variant: "secondary", icon: <Clock className="size-3" /> },
    PROCESSING: { label: "Processing", variant: "outline", icon: <Loader2 className="size-3 animate-spin" /> },
    COMPLETED: { label: "Completed", variant: "default", icon: <CheckCircle2 className="size-3" /> },
    FAILED: { label: "Failed", variant: "destructive", icon: <XCircle className="size-3" /> },
    TEMP: { label: "Temp", variant: "secondary", icon: <Clock className="size-3" /> },
    error: { label: "Error", variant: "destructive", icon: <AlertCircle className="size-3" /> },
    warn: { label: "Warning", variant: "outline", icon: <AlertCircle className="size-3" /> },
    info: { label: "Info", variant: "secondary", icon: <AlertCircle className="size-3" /> },
  }
  const cfg = map[status] ?? map.PENDING
  return (
    <Badge variant={cfg.variant} className="gap-1">
      {cfg.icon}
      {cfg.label}
    </Badge>
  )
}

// ==============================================================================
// COMPONENT
// ==============================================================================

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [range, setRange] = React.useState<"7d" | "30d" | "90d">("7d")

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/dashboard?range=${range}`, {
        cache: "no-store",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Gagal memuat data")
      }
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Fetch dashboard error:", error)
      toast.error(error instanceof Error ? error.message : "Gagal memuat dashboard")
    } finally {
      setLoading(false)
    }
  }, [range])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // ==========================================================================
  // LOADING
  // ==========================================================================
  if (loading && !data) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  // ==========================================================================
  // ERROR
  // ==========================================================================
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 size-10 text-destructive" />
          <p className="text-sm text-muted-foreground">Gagal memuat dashboard</p>
          <Button className="mt-4" onClick={fetchData}>
            <RefreshCw className="size-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // MAIN
  // ==========================================================================
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan platform berdasarkan database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setRange(r)}
              >
                {r === "7d" ? "7 Hari" : r === "30d" ? "30 Hari" : "90 Hari"}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Separator />

      {/* ================= 4 STAT UTAMA ================= */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          description={`${data.totalAdmins} admin · ${data.totalPremiumUsers} premium`}
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="Total Files"
          value={data.totalFiles.toLocaleString()}
          description={`${formatBytes(data.totalSizeBytes)} terpakai`}
          icon={<Folder className="size-4" />}
        />
        <StatCard
          title="Total Tasks"
          value={data.totalTasks.toLocaleString()}
          description={`${data.completedTasks} selesai · ${data.failedTasks} gagal`}
          icon={<ListChecks className="size-4" />}
        />
        <StatCard
          title="Error Logs"
          value={data.errorLogs.toLocaleString()}
          description={`dari ${data.totalLogs} total log`}
          icon={<XCircle className="size-4" />}
          variant={data.errorLogs > 0 ? "destructive" : "default"}
        />
      </div>

      {/* ================= CHART ================= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pertumbuhan</CardTitle>
          <CardDescription>
            Users, Files, dan Tasks{" "}
            {range === "7d" ? "7" : range === "30d" ? "30" : "90"} hari terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#colorUsers)" name="Users" />
                <Area type="monotone" dataKey="files" stroke="#10b981" fill="url(#colorFiles)" name="Files" />
                <Area type="monotone" dataKey="tasks" stroke="#ec4899" fill="url(#colorTasks)" name="Tasks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ================= STATUS BREAKDOWN ================= */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Task Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Task</CardTitle>
            <CardDescription>Distribusi DocumentTask</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatusRow label="Pending" value={data.pendingTasks} status="PENDING" />
            <StatusRow label="Processing" value={data.processingTasks} status="PROCESSING" />
            <StatusRow label="Completed" value={data.completedTasks} status="COMPLETED" />
            <StatusRow label="Failed" value={data.failedTasks} status="FAILED" />
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Storage</CardTitle>
            <CardDescription>Distribusi file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StorageRow icon={<HardDrive className="size-4" />} label="Supabase" value={data.supabaseFiles} total={data.totalFiles} />
            <StorageRow icon={<Folder className="size-4" />} label="Google Drive" value={data.driveFiles} total={data.totalFiles} />
            <StorageRow icon={<Clock className="size-4" />} label="Expired" value={data.expiredFiles} total={data.totalFiles} variant="warning" />
          </CardContent>
        </Card>

        {/* Menu & Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu & Log</CardTitle>
            <CardDescription>Konten dinamis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StorageRow icon={<LayoutGrid className="size-4" />} label="Tool Categories" value={data.totalCategories} total={data.totalCategories} />
            <StorageRow icon={<LayoutGrid className="size-4" />} label="Menu Aktif" value={data.activeMenus} total={data.totalMenus} variant="success" />
            <StorageRow icon={<Database className="size-4" />} label="System Logs" value={data.totalLogs} total={data.totalLogs} />
          </CardContent>
        </Card>
      </div>

      {/* ================= RECENT ================= */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Task Terbaru</CardTitle>
              <CardDescription>5 task terbaru</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/tasks" />}
            >
              Lihat Semua
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada task
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {task.toolType}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {task.user?.email ?? "—"} ·{" "}
                          {formatDistanceToNow(new Date(task.createdAt), {
                            addSuffix: true,
                            locale: localeId,
                          })}
                        </p>
                      </div>
                    </div>
                    {statusBadge(task.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">User Terbaru</CardTitle>
              <CardDescription>5 user terbaru</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/users" />}
            >
              Lihat Semua
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentUsers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada user
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-8">
                        {u.image ? (
                          <AvatarImage src={u.image} alt={u.name ?? ""} />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {u.name?.charAt(0).toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {u.name ?? "—"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email ?? "—"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================= RECENT LOGS ================= */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Log Sistem Terbaru</CardTitle>
            <CardDescription>8 log terbaru</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/system/logs" />}
          >
            Lihat Semua
            <ArrowRight className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada log
            </p>
          ) : (
            <div className="space-y-2">
              {data.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {statusBadge(log.level)}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{log.action}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {log.message}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: localeId,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ==============================================================================
// SUB-COMPONENTS
// ==============================================================================

function StatCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  variant?: "default" | "success" | "warning" | "destructive"
}) {
  const variantClass = {
    default: "",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    destructive: "text-red-600 dark:text-red-400",
  }[variant]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className={variantClass || "text-muted-foreground"}>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variantClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatusRow({
  label,
  value,
  status,
}: {
  label: string
  value: number
  status: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      {statusBadge(status)}
      <span className="text-sm font-semibold">{value.toLocaleString()}</span>
    </div>
  )
}

function StorageRow({
  icon,
  label,
  value,
  total,
  variant = "default",
}: {
  icon: React.ReactNode
  label: string
  value: number
  total: number
  variant?: "default" | "success" | "warning"
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  const variantClass = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
  }[variant]

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span className={variantClass}>{icon}</span>
          <span className="font-medium">{label}</span>
        </span>
        <span className="font-semibold tabular-nums">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}