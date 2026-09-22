// lib/queries/system.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ==============================================================================
// LOGS
// ==============================================================================

export interface LogsFilter {
  q?: string;
  level?: string;
  action?: string;
  page?: number;
  perPage?: number;
}

export async function getLogsList(filter: LogsFilter) {
  const page = Math.max(1, filter.page ?? 1);
  const perPage = filter.perPage ?? 30;

  const where: Prisma.SystemLogWhereInput = {};

  if (filter.q) {
    where.OR = [
      { message: { contains: filter.q, mode: "insensitive" } },
      { action: { contains: filter.q, mode: "insensitive" } },
    ];
  }
  if (filter.level) where.level = filter.level;
  if (filter.action) where.action = filter.action;

  const [items, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.systemLog.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getLogsStats() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    total,
    errorTotal,
    warnTotal,
    infoTotal,
    debugTotal,
    last24hCount,
    last7dCount,
    errorLast24h,
  ] = await Promise.all([
    prisma.systemLog.count(),
    prisma.systemLog.count({ where: { level: "error" } }),
    prisma.systemLog.count({ where: { level: "warn" } }),
    prisma.systemLog.count({ where: { level: "info" } }),
    prisma.systemLog.count({ where: { level: "debug" } }),
    prisma.systemLog.count({ where: { createdAt: { gte: last24h } } }),
    prisma.systemLog.count({ where: { createdAt: { gte: last7d } } }),
    prisma.systemLog.count({
      where: { level: "error", createdAt: { gte: last24h } },
    }),
  ]);

  return {
    total,
    errorTotal,
    warnTotal,
    infoTotal,
    debugTotal,
    last24hCount,
    last7dCount,
    errorLast24h,
  };
}

export async function getTopActions(limit = 10) {
  return prisma.systemLog.groupBy({
    by: ["action"],
    _count: { _all: true },
    orderBy: { _count: { action: "desc" } },
    take: limit,
  });
}

// ==============================================================================
// TIMELINE (7 hari terakhir, grouped by date + level)
// ==============================================================================

export interface DailyLogCount {
  date: string; // "2026-09-23"
  error: number;
  warn: number;
  info: number;
  debug: number;
  total: number;
}

const LEVELS = ["error", "warn", "info", "debug"] as const;
type LogLevel = (typeof LEVELS)[number];

/**
 * Log harian per level, N hari terakhir.
 * Pakai findMany + grouping di JS → type-safe & tidak butuh raw SQL.
 */
export async function getLogsTimeline(days = 7): Promise<DailyLogCount[]> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  // Ambil log mentah (hanya createdAt & level — ringan)
  const rows = await prisma.systemLog.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, level: true },
  });

  // Build kerangka N hari — semua level mulai dari 0
  const dateMap = new Map<string, DailyLogCount>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    dateMap.set(key, {
      date: key,
      error: 0,
      warn: 0,
      info: 0,
      debug: 0,
      total: 0,
    });
  }

  // Isi dari rows
  for (const row of rows) {
    const key = toDateKey(row.createdAt);
    const entry = dateMap.get(key);
    if (!entry) continue;

    const level = row.level as LogLevel;
    if (LEVELS.includes(level)) {
      entry[level] += 1;
      entry.total += 1;
    }
  }

  return Array.from(dateMap.values());
}

// Helper: format date ke "YYYY-MM-DD" berdasarkan **waktu lokal**
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ==============================================================================
// HOURLY ACTIVITY (24 jam terakhir)
// ==============================================================================

export interface HourlyActivity {
  hour: string; // "14:00"
  count: number;
}

export async function getHourlyActivity(): Promise<HourlyActivity[]> {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const rows = await prisma.systemLog.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  // Buat kerangka 24 jam (termasuk yang kosong)
  const hourMap = new Map<string, number>();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    const key = toHourKey(d);
    hourMap.set(key, 0);
  }

  for (const row of rows) {
    const d = new Date(row.createdAt);
    d.setMinutes(0, 0, 0);
    const key = toHourKey(d);
    if (hourMap.has(key)) {
      hourMap.set(key, (hourMap.get(key) ?? 0) + 1);
    }
  }

  return Array.from(hourMap.entries()).map(([hour, count]) => ({
    hour,
    count,
  }));
}

function toHourKey(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  return `${h}:00`;
}

// ==============================================================================
// DATABASE HEALTH & STATS
// ==============================================================================

export async function getDatabaseHealth() {
  const start = Date.now();
  let dbLatencyMs = 0;
  let dbOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const [users, files, tasks, toolCategories, toolMenus, logs] =
    await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
      prisma.documentTask.count(),
      prisma.toolCategory.count(),
      prisma.toolMenu.count(),
      prisma.systemLog.count(),
    ]);

  return {
    dbOk,
    dbLatencyMs,
    counts: { users, files, tasks, toolCategories, toolMenus, logs },
  };
}

export interface TableStat {
  name: string;
  count: number;
}

export async function getTableStats(): Promise<TableStat[]> {
  const [users, files, tasks, toolCategories, toolMenus, logs] =
    await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
      prisma.documentTask.count(),
      prisma.toolCategory.count(),
      prisma.toolMenu.count(),
      prisma.systemLog.count(),
    ]);

  return [
    { name: "Users", count: users },
    { name: "Files", count: files },
    { name: "Tasks", count: tasks },
    { name: "Categories", count: toolCategories },
    { name: "Tool Menus", count: toolMenus },
    { name: "Logs", count: logs },
  ];
}