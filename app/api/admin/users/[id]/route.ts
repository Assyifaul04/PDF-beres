import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { userUpdateSchema } from "@/lib/validators/user";
import { ok, fail } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

// ==========================================
// GET /api/admin/users/[id]
// ==========================================
export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { error } = await requireAdmin();
  if (error) return error;

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

  if (!user) return fail("User tidak ditemukan", 404);

  return ok({
    ...user,
    usedBytes: user.usedBytes.toString(),
    files: user.files.map((f) => ({
      ...f,
      sizeBytes: f.sizeBytes.toString(),
    })),
  });
}

// ==========================================
// PATCH /api/admin/users/[id]
// Body: { name?, role?, plan? }
// ==========================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const body = await req.json();
  const parsed = userUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Data tidak valid", 422, parsed.error.flatten());
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail("User tidak ditemukan", 404);

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
  });

  return ok({ ...updated, usedBytes: updated.usedBytes.toString() });
}

// ==========================================
// DELETE /api/admin/users/[id]
// ==========================================
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { error, user: currentAdmin } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  // Cegah admin hapus dirinya sendiri
  if (currentAdmin?.id === id) {
    return fail("Tidak bisa menghapus akun sendiri", 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail("User tidak ditemukan", 404);

  // Cascade delete: Account, Session, File, DocumentTask akan terhapus
  // sesuai onDelete di schema Prisma
  await prisma.user.delete({ where: { id } });

  return ok({ id, deleted: true });
}