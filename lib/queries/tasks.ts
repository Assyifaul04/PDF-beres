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

  return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getTasksStats() {
  const [total, pending, processing, completed, failed] = await Promise.all([
    prisma.documentTask.count(),
    prisma.documentTask.count({ where: { status: "PENDING" } }),
    prisma.documentTask.count({ where: { status: "PROCESSING" } }),
    prisma.documentTask.count({ where: { status: "COMPLETED" } }),
    prisma.documentTask.count({ where: { status: "FAILED" } }),
  ]);

  return { total, pending, processing, completed, failed };
}

export async function getTasksByToolType() {
  const groups = await prisma.documentTask.groupBy({
    by: ["toolType"],
    _count: { _all: true },
    _max: { createdAt: true },
    orderBy: { _count: { toolType: "desc" } },
  });

  // Breakdown status per toolType
  const withStatus = await Promise.all(
    groups.map(async (g) => {
      const [pending, processing, completed, failed] = await Promise.all([
        prisma.documentTask.count({
          where: { toolType: g.toolType, status: "PENDING" },
        }),
        prisma.documentTask.count({
          where: { toolType: g.toolType, status: "PROCESSING" },
        }),
        prisma.documentTask.count({
          where: { toolType: g.toolType, status: "COMPLETED" },
        }),
        prisma.documentTask.count({
          where: { toolType: g.toolType, status: "FAILED" },
        }),
      ]);
      return { ...g, pending, processing, completed, failed };
    })
  );

  return withStatus;
}

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