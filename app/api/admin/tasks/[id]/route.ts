// app/api/admin/tasks/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { TaskStatus } from "@prisma/client";

type Params = Promise<{ id: string }>;

// GET detail
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const task = await prisma.documentTask.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      inputFiles: { include: { file: true }, orderBy: { order: "asc" } },
      outputFiles: { include: { file: true } },
    },
  });

  if (!task) return fail("Task tidak ditemukan", 404);
  return ok(task);
}

// PATCH — update status / errorMessage
const updateSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  errorMessage: z.string().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
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
  const updated = await prisma.documentTask.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.errorMessage !== undefined && {
        errorMessage: data.errorMessage,
      }),
      ...(data.completedAt !== undefined && {
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
      }),
      // Auto-set completedAt kalau status COMPLETED/FAILED
      ...(data.status === "COMPLETED" &&
        !data.completedAt && { completedAt: new Date() }),
      ...(data.status === "FAILED" &&
        !data.completedAt && { completedAt: new Date() }),
    },
  });

  return ok(updated);
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.documentTask.findUnique({ where: { id } });
  if (!existing) return fail("Task tidak ditemukan", 404);

  await prisma.documentTask.delete({ where: { id } });
  return ok({ id, deleted: true });
}