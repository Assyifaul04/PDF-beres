// lib/queries/files.ts
import { prisma } from "@/lib/prisma";
import { Prisma, StorageProvider, MigrationStatus } from "@prisma/client";

export interface FilesFilter {
  q?: string;
  provider?: StorageProvider;
  migrationStatus?: MigrationStatus;
  userId?: string;
  page?: number;
  perPage?: number;
}

export async function getFilesList(filter: FilesFilter) {
  const page = Math.max(1, filter.page ?? 1);
  const perPage = filter.perPage ?? 20;

  const where: Prisma.FileWhereInput = {};

  if (filter.q) {
    where.OR = [
      { originalName: { contains: filter.q, mode: "insensitive" } },
      { fileKey: { contains: filter.q, mode: "insensitive" } },
    ];
  }
  if (filter.provider) where.storageProvider = filter.provider;
  if (filter.migrationStatus) where.migrationStatus = filter.migrationStatus;
  if (filter.userId) where.userId = filter.userId;

  const [items, total] = await Promise.all([
    prisma.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { taskInputs: true, taskOutputs: true } },
      },
    }),
    prisma.file.count({ where }),
  ]);

  return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getFilesStats() {
  const now = new Date();
  const [
    total,
    totalBytes,
    supabaseCount,
    driveCount,
    tempCount,
    processingCount,
    completedCount,
    failedCount,
    expiredCount,
  ] = await Promise.all([
    prisma.file.count(),
    prisma.file.aggregate({ _sum: { sizeBytes: true } }),
    prisma.file.count({ where: { storageProvider: "SUPABASE" } }),
    prisma.file.count({ where: { storageProvider: "GOOGLE_DRIVE" } }),
    prisma.file.count({ where: { migrationStatus: "TEMP" } }),
    prisma.file.count({ where: { migrationStatus: "PROCESSING" } }),
    prisma.file.count({ where: { migrationStatus: "COMPLETED" } }),
    prisma.file.count({ where: { migrationStatus: "FAILED" } }),
    prisma.file.count({ where: { expiresAt: { lt: now } } }),
  ]);

  return {
    total,
    totalBytes: totalBytes._sum.sizeBytes ?? BigInt(0),
    supabaseCount,
    driveCount,
    tempCount,
    processingCount,
    completedCount,
    failedCount,
    expiredCount,
  };
}