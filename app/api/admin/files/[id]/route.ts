// app/api/admin/files/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { MigrationStatus, StorageProvider } from "@prisma/client";

type Params = Promise<{ id: string }>;

// GET detail
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const file = await prisma.file.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      taskInputs: {
        include: {
          task: { select: { id: true, toolType: true, status: true } },
        },
      },
      taskOutputs: {
        include: {
          task: { select: { id: true, toolType: true, status: true } },
        },
      },
    },
  });

  if (!file) return fail("File tidak ditemukan", 404);

  return ok({
    ...file,
    sizeBytes: file.sizeBytes.toString(),
  });
}

// PATCH — update migration status / move to Drive
const updateSchema = z.object({
  migrationStatus: z.nativeEnum(MigrationStatus).optional(),
  storageProvider: z.nativeEnum(StorageProvider).optional(),
  driveFileId: z.string().optional().nullable(),
  moveToDriveAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Data tidak valid", 422, parsed.error.flatten());
  }

  const data = parsed.data;

  const updated = await prisma.file.update({
    where: { id },
    data: {
      ...(data.migrationStatus && { migrationStatus: data.migrationStatus }),
      ...(data.storageProvider && { storageProvider: data.storageProvider }),
      ...(data.driveFileId !== undefined && { driveFileId: data.driveFileId }),
      ...(data.moveToDriveAt && { moveToDriveAt: new Date(data.moveToDriveAt) }),
      ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
    },
  });

  return ok({ ...updated, sizeBytes: updated.sizeBytes.toString() });
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.file.findUnique({ where: { id } });
  if (!existing) return fail("File tidak ditemukan", 404);

  await prisma.file.delete({ where: { id } });

  return ok({ id, deleted: true });
}