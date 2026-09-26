// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type SessionUserWithRole = {
  id?: string
  role?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export async function GET(request: Request) {
  try {
    // ✅ 1. Auth
    const session = await getServerSession(authOptions)
    const user = session?.user as SessionUserWithRole | undefined

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // ✅ 2. Range
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"
    const daysAgo = range === "30d" ? 30 : range === "90d" ? 90 : 7

    // ========================================================================
    // ✅ 3. BATCH 1 — USER (4 query)
    // ========================================================================
    const [
      totalUsers,
      totalAdmins,
      totalPremiumUsers,
      totalFreeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { plan: "PREMIUM" } }),
      prisma.user.count({ where: { plan: "FREE" } }),
    ])

    // ========================================================================
    // ✅ 4. BATCH 2 — FILE (5 query)
    // ========================================================================
    const [
      totalFiles,
      supabaseFiles,
      driveFiles,
      totalSizeBytesAgg,
      expiredFiles,
    ] = await Promise.all([
      prisma.file.count(),
      prisma.file.count({ where: { storageProvider: "SUPABASE" } }),
      prisma.file.count({ where: { storageProvider: "GOOGLE_DRIVE" } }),
      prisma.file.aggregate({ _sum: { sizeBytes: true } }),
      prisma.file.count({ where: { expiresAt: { lt: new Date() } } }),
    ])

    // ========================================================================
    // ✅ 5. BATCH 3 — GROUP BY (2 query)
    // ========================================================================
    const [filesByMigration, tasksByStatus] = await Promise.all([
      prisma.file.groupBy({
        by: ["migrationStatus"],
        _count: { _all: true },
      }),
      prisma.documentTask.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ])

    // ========================================================================
    // ✅ 6. BATCH 4 — COUNT + LOG (5 query)
    // ========================================================================
    const [
      totalTasks,
      totalCategories,
      totalMenus,
      activeMenus,
      totalLogs,
      errorLogs,
    ] = await Promise.all([
      prisma.documentTask.count(),
      prisma.toolCategory.count(),
      prisma.toolMenu.count(),
      prisma.toolMenu.count({ where: { isActive: true } }),
      prisma.systemLog.count(),
      prisma.systemLog.count({ where: { level: "error" } }),
    ])

    // ========================================================================
    // ✅ 7. BATCH 5 — RECENT DATA (3 query)
    // ========================================================================
    const [recentUsers, recentTasks, recentLogs] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          plan: true,
          createdAt: true,
        },
      }),
      prisma.documentTask.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          toolType: true,
          status: true,
          errorMessage: true,
          createdAt: true,
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      }),
      prisma.systemLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          level: true,
          action: true,
          message: true,
          createdAt: true,
        },
      }),
    ])

    // ========================================================================
    // ✅ 8. BATCH 6 — CHART DATA (1 query)
    // ========================================================================
    const chartData = await prisma.$queryRaw<
      Array<{ date: Date; users: bigint; files: bigint; tasks: bigint }>
    >`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${daysAgo - 1} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      )
      SELECT
        d.date,
        COALESCE((SELECT COUNT(*) FROM users u WHERE u."createdAt"::date = d.date), 0) AS users,
        COALESCE((SELECT COUNT(*) FROM files f WHERE f."createdAt"::date = d.date), 0) AS files,
        COALESCE((SELECT COUNT(*) FROM document_tasks t WHERE t."createdAt"::date = d.date), 0) AS tasks
      FROM dates d
      ORDER BY d.date ASC
    `

    // ✅ 9. Helper group by
    const migrationMap = Object.fromEntries(
      filesByMigration.map((f) => [f.migrationStatus, f._count._all])
    )
    const statusMap = Object.fromEntries(
      tasksByStatus.map((t) => [t.status, t._count._all])
    )

    // ✅ 10. Response
    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalPremiumUsers,
      totalFreeUsers,

      totalFiles,
      supabaseFiles,
      driveFiles,
      totalSizeBytes: totalSizeBytesAgg._sum.sizeBytes?.toString() ?? "0",
      expiredFiles,
      tempFiles: migrationMap.TEMP ?? 0,
      processingMigration: migrationMap.PROCESSING ?? 0,
      completedMigration: migrationMap.COMPLETED ?? 0,
      failedMigration: migrationMap.FAILED ?? 0,

      totalTasks,
      pendingTasks: statusMap.PENDING ?? 0,
      processingTasks: statusMap.PROCESSING ?? 0,
      completedTasks: statusMap.COMPLETED ?? 0,
      failedTasks: statusMap.FAILED ?? 0,

      totalCategories,
      totalMenus,
      activeMenus,

      totalLogs,
      errorLogs,

      recentUsers: recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      recentTasks: recentTasks.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      })),
      recentLogs: recentLogs.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
      })),

      chartData: chartData.map((d) => ({
        date: new Date(d.date).toISOString().slice(5, 10),
        users: Number(d.users),
        files: Number(d.files),
        tasks: Number(d.tasks),
      })),
    })
  } catch (error) {
    console.error("[ADMIN_DASHBOARD_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}