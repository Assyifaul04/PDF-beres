// lib/queries/tasks.ts
import { prisma } from "@/lib/prisma";
import { Prisma, TaskStatus, ToolType } from "@prisma/client";

export interface TasksFilter {
  q?: string;
  status?: TaskStatus;
  toolType?: ToolType;
  userId?: string;
  page?: number;
  perPage?: number;
}

// ============================================================================
// TASKS LIST (tidak berubah)
// ============================================================================

export async function getTasksList(filter: TasksFilter) {
  const page = Math.max(1, filter.page ?? 1);
  const perPage = filter.perPage ?? 20;

  const where: Prisma.DocumentTaskWhereInput = {};

  if (filter.q) {
    where.OR = [
      { id: { contains: filter.q, mode: "insensitive" } },
      { errorMessage: { contains: filter.q, mode: "insensitive" } },
      {
        user: {
          OR: [
            { email: { contains: filter.q, mode: "insensitive" } },
            { name: { contains: filter.q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }
  if (filter.status) where.status = filter.status;
  if (filter.toolType) where.toolType = filter.toolType;
  if (filter.userId) where.userId = filter.userId;

  const [items, total] = await Promise.all([
    prisma.documentTask.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { inputFiles: true, outputFiles: true } },
      },
    }),
    prisma.documentTask.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

// ============================================================================
// TASKS STATS (tidak berubah)
// ============================================================================

export async function getTasksStats() {
  // ✅ Optimasi: satu groupBy menggantikan 5 count() terpisah
  const grouped = await prisma.documentTask.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const stats = {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  for (const row of grouped) {
    const count = row._count._all;
    stats.total += count;
    switch (row.status) {
      case "PENDING":
        stats.pending = count;
        break;
      case "PROCESSING":
        stats.processing = count;
        break;
      case "COMPLETED":
        stats.completed = count;
        break;
      case "FAILED":
        stats.failed = count;
        break;
    }
  }

  return stats;
}

// ============================================================================
// TASKS BY TOOL TYPE (🔥 FIXED — akar masalah P2024)
// ============================================================================

export interface ToolTypeGroup {
  toolType: ToolType;
  _count: { _all: number };
  _max: { createdAt: Date | null };
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

/**
 * Statistik task dikelompokkan per toolType.
 *
 * ✅ FIX: gunakan SATU query `groupBy(["toolType","status"])` sebagai
 * ganti pola lama N × 4 `count()` di dalam `Promise.all` + `map`.
 *
 * Sebelum:
 *   - 21 tool × 4 status = 84 query paralel
 *   - Connection pool default Prisma = 5
 *   - Hasil: P2024 timeout (10s)
 *
 * Sesudah:
 *   - 1 query groupBy
 *   - 1 round-trip ke database
 *   - Aman untuk connection pool kecil (Neon/Supabase free tier)
 */
export async function getTasksByToolType(): Promise<ToolTypeGroup[]> {
  // ---------- 1. groupBy (toolType, status) ----------
  const grouped = await prisma.documentTask.groupBy({
    by: ["toolType", "status"],
    _count: { _all: true },
    _max: { createdAt: true },
  });

  // ---------- 2. Susun menjadi Map<toolType, ToolTypeGroup> ----------
  const map = new Map<ToolType, ToolTypeGroup>();

  for (const row of grouped) {
    const key = row.toolType;

    if (!map.has(key)) {
      map.set(key, {
        toolType: key,
        _count: { _all: 0 },
        _max: { createdAt: null },
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      });
    }

    const entry = map.get(key)!;
    const count = row._count._all;

    entry._count._all += count;

    // _max.createdAt: ambil nilai terbaru antar status
    const rowMax = row._max.createdAt;
    if (
      rowMax &&
      (!entry._max.createdAt || rowMax > entry._max.createdAt)
    ) {
      entry._max.createdAt = rowMax;
    }

    switch (row.status) {
      case "PENDING":
        entry.pending = count;
        break;
      case "PROCESSING":
        entry.processing = count;
        break;
      case "COMPLETED":
        entry.completed = count;
        break;
      case "FAILED":
        entry.failed = count;
        break;
    }
  }

  // ---------- 3. Urutkan berdasarkan total desc ----------
  return Array.from(map.values()).sort(
    (a, b) => b._count._all - a._count._all
  );
}

// ============================================================================
// HELPERS
// ============================================================================

export function getToolTypeLabel(toolType: ToolType): string {
  const map: Record<ToolType, string> = {
    MERGE_PDF: "Merge PDF",
    SPLIT_PDF: "Split PDF",
    COMPRESS_PDF: "Compress PDF",
    PDF_TO_WORD: "PDF to Word",
    PDF_TO_POWERPOINT: "PDF to PowerPoint",
    PDF_TO_EXCEL: "PDF to Excel",
    WORD_TO_PDF: "Word to PDF",
    POWERPOINT_TO_PDF: "PowerPoint to PDF",
    EXCEL_TO_PDF: "Excel to PDF",
    EDIT_PDF: "Edit PDF",
    PDF_TO_JPG: "PDF to JPG",
    JPG_TO_PDF: "JPG to PDF",
    SIGN_PDF: "Sign PDF",
    WATERMARK_PDF: "Watermark PDF",
    ROTATE_PDF: "Rotate PDF",
    HTML_TO_PDF: "HTML to PDF",
    UNLOCK_PDF: "Unlock PDF",
    PROTECT_PDF: "Protect PDF",
    ORGANIZE_PDF: "Organize PDF",
    REPAIR_PDF: "Repair PDF",
    PAGE_NUMBERS: "Page Numbers",
  };
  return map[toolType] ?? toolType;
}