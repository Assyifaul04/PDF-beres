//app/admin/dashboard/page.tsx
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
import {
  Users,
  Folder,
  ListChecks,
  Database,
  LayoutGrid,
  HardDrive,
  CloudUpload,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  FileText,
  ArrowRight,
} from "lucide-react"

// ==============================================================================
// TYPE DEFINITIONS (mengikuti schema Prisma)
// ==============================================================================

type Role = "USER" | "ADMIN"
type PlanType = "FREE" | "PREMIUM"
type StorageProvider = "SUPABASE" | "GOOGLE_DRIVE"
type MigrationStatus = "TEMP" | "PROCESSING" | "COMPLETED" | "FAILED"
type TaskStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

type Stats = {
  // User
  totalUsers: number
  adminUsers: number
  premiumUsers: number
  freeUsers: number

  // File
  totalFiles: number
  totalSizeBytes: bigint
  supabaseFiles: number
  driveFiles: number
  tempFiles: number
  processingMigration: number
  completedMigration: number
  failedMigration: number
  expiredFiles: number

  // DocumentTask
  totalTasks: number
  pendingTasks: number
  processingTasks: number
  completedTasks: number
  failedTasks: number

  // ToolMenu
  totalCategories: number
  totalMenus: number
  activeMenus: number

  // SystemLog
  totalLogs: number
  errorLogs: number
}

// ==============================================================================
// MOCK DATA (ganti dengan fetch dari API / Prisma)
// ==============================================================================

const mockStats: Stats = {
  totalUsers: 1240,
  adminUsers: 5,
  premiumUsers: 320,
  freeUsers: 915,

  totalFiles: 8420,
  totalSizeBytes: BigInt(52_428_800_000), // ~52 GB
  supabaseFiles: 3200,
  driveFiles: 5220,
  tempFiles: 120,
  processingMigration: 45,
  completedMigration: 8100,
  failedMigration: 15,
  expiredFiles: 80,

  totalTasks: 15600,
  pendingTasks: 42,
  processingTasks: 18,
  completedTasks: 15300,
  failedTasks: 240,

  totalCategories: 6,
  totalMenus: 21,
  activeMenus: 19,

  totalLogs: 45200,
  errorLogs: 128,
}

const recentTasks: {
  id: string
  toolType: string
  status: TaskStatus
  user: string
  createdAt: string
}[] = [
  { id: "tsk_1", toolType: "MERGE_PDF", status: "COMPLETED", user: "budi@mail.com", createdAt: "2 min ago" },
  { id: "tsk_2", toolType: "WORD_TO_PDF", status: "PROCESSING", user: "siti@mail.com", createdAt: "5 min ago" },
  { id: "tsk_3", toolType: "SPLIT_PDF", status: "PENDING", user: "andi@mail.com", createdAt: "8 min ago" },
  { id: "tsk_4", toolType: "COMPRESS_PDF", status: "FAILED", user: "dewi@mail.com", createdAt: "12 min ago" },
  { id: "tsk_5", toolType: "PDF_TO_JPG", status: "COMPLETED", user: "rizky@mail.com", createdAt: "15 min ago" },
]

const toolCategories: {
  name: string
  slug: string
  menuCount: number
  isActive: boolean
}[] = [
  { name: "Konversi ke PDF", slug: "konversi-ke-pdf", menuCount: 5, isActive: true },
  { name: "Konversi dari PDF", slug: "konversi-dari-pdf", menuCount: 4, isActive: true },
  { name: "Edit PDF", slug: "edit-pdf", menuCount: 6, isActive: true },
  { name: "Keamanan PDF", slug: "keamanan-pdf", menuCount: 3, isActive: true },
  { name: "Organize PDF", slug: "organize-pdf", menuCount: 3, isActive: true },
]

// ==============================================================================
// HELPERS
// ==============================================================================

function formatBytes(bytes: bigint): string {
  const num = Number(bytes)
  if (num === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(num) / Math.log(k))
  return `${(num / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function statusBadge(status: TaskStatus | MigrationStatus) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    PENDING: { label: "Pending", variant: "secondary", icon: <Clock className="size-3" /> },
    PROCESSING: { label: "Processing", variant: "outline", icon: <Loader2 className="size-3 animate-spin" /> },
    COMPLETED: { label: "Completed", variant: "default", icon: <CheckCircle2 className="size-3" /> },
    FAILED: { label: "Failed", variant: "destructive", icon: <XCircle className="size-3" /> },
    TEMP: { label: "Temp", variant: "secondary", icon: <Clock className="size-3" /> },
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
  const stats = mockStats

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of users, files, tasks, and system health
          </p>
        </div>
        <Button render={<Link href="/admin/analytics" />}>
          <TrendingUp className="size-4" />
          View Analytics
        </Button>
      </div>

      <Separator />

      {/* ================= SECTION 1: USERS (model User) ================= */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Users
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            description="Semua role & plan"
            icon={<Users className="size-4" />}
          />
          <StatCard
            title="Admins"
            value={stats.adminUsers.toLocaleString()}
            description="role = ADMIN"
            icon={<Users className="size-4" />}
          />
          <StatCard
            title="Premium"
            value={stats.premiumUsers.toLocaleString()}
            description="plan = PREMIUM"
            icon={<TrendingUp className="size-4" />}
          />
          <StatCard
            title="Free"
            value={stats.freeUsers.toLocaleString()}
            description="plan = FREE"
            icon={<Users className="size-4" />}
          />
        </div>
      </section>

      {/* ================= SECTION 2: FILES (model File) ================= */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Folder className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Files & Storage
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Files"
            value={stats.totalFiles.toLocaleString()}
            description={`Total: ${formatBytes(stats.totalSizeBytes)}`}
            icon={<Folder className="size-4" />}
          />
          <StatCard
            title="Supabase"
            value={stats.supabaseFiles.toLocaleString()}
            description="storageProvider = SUPABASE"
            icon={<HardDrive className="size-4" />}
          />
          <StatCard
            title="Google Drive"
            value={stats.driveFiles.toLocaleString()}
            description="storageProvider = GOOGLE_DRIVE"
            icon={<CloudUpload className="size-4" />}
          />
          <StatCard
            title="Expired"
            value={stats.expiredFiles.toLocaleString()}
            description="expiresAt < now()"
            icon={<Clock className="size-4" />}
            variant="warning"
          />
        </div>

        {/* Migration Status Breakdown */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Migration Status</CardTitle>
            <CardDescription>
              Monitoring perpindahan file dari Supabase ke Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <StatusRow label="TEMP" value={stats.tempFiles} status="TEMP" />
              <StatusRow label="PROCESSING" value={stats.processingMigration} status="PROCESSING" />
              <StatusRow label="COMPLETED" value={stats.completedMigration} status="COMPLETED" />
              <StatusRow label="FAILED" value={stats.failedMigration} status="FAILED" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ================= SECTION 3: DOCUMENT TASKS (model DocumentTask) ================= */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Document Tasks
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks.toLocaleString()}
            description="Semua ToolType"
            icon={<ListChecks className="size-4" />}
          />
          <StatCard
            title="Pending"
            value={stats.pendingTasks.toLocaleString()}
            description="status = PENDING"
            icon={<Clock className="size-4" />}
          />
          <StatCard
            title="Processing"
            value={stats.processingTasks.toLocaleString()}
            description="status = PROCESSING"
            icon={<Loader2 className="size-4 animate-spin" />}
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks.toLocaleString()}
            description="status = COMPLETED"
            icon={<CheckCircle2 className="size-4" />}
            variant="success"
          />
          <StatCard
            title="Failed"
            value={stats.failedTasks.toLocaleString()}
            description="status = FAILED"
            icon={<XCircle className="size-4" />}
            variant="destructive"
          />
        </div>
      </section>

      {/* ================= SECTION 4: RECENT TASKS + TOOL MENUS ================= */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <CardDescription>5 task terbaru dari DocumentTask</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/admin/tasks" />}>
              View All
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{task.toolType}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.user} · {task.createdAt}
                      </p>
                    </div>
                  </div>
                  {statusBadge(task.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tool Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Tool Categories</CardTitle>
              <CardDescription>
                {stats.totalCategories} kategori · {stats.activeMenus}/{stats.totalMenus} menu aktif
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/admin/tool-menus/categories" />}>
              Manage
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {toolCategories.map((cat) => (
                <div
                  key={cat.slug}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        /{cat.slug} · {cat.menuCount} menus
                      </p>
                    </div>
                  </div>
                  <Badge variant={cat.isActive ? "default" : "secondary"}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= SECTION 5: SYSTEM (model SystemLog) ================= */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Database className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            System
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Logs"
            value={stats.totalLogs.toLocaleString()}
            description="SystemLog entries"
            icon={<Database className="size-4" />}
          />
          <StatCard
            title="Error Logs"
            value={stats.errorLogs.toLocaleString()}
            description="level = error"
            icon={<XCircle className="size-4" />}
            variant="destructive"
          />
          <StatCard
            title="System Health"
            value="99.9%"
            description="Uptime 30 hari terakhir"
            icon={<CheckCircle2 className="size-4" />}
            variant="success"
          />
        </div>
      </section>
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
  status: TaskStatus | MigrationStatus
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-2">
        {statusBadge(status)}
      </div>
      <span className="text-sm font-semibold">{value.toLocaleString()}</span>
    </div>
  )
}