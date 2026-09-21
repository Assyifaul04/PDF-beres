import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { userRoleUpdateSchema } from "@/lib/validators/user";
import { ok, fail } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

// ==========================================
// PATCH /api/admin/users/[id]/role
// Body: { role: "USER" | "ADMIN" }
// ==========================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { error, user: currentAdmin } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const parsed = userRoleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Role tidak valid", 422, parsed.error.flatten());
  }

  // Cegah admin downgrade dirinya sendiri
  if (currentAdmin?.id === id && parsed.data.role === "USER") {
    return fail("Tidak bisa downgrade role sendiri", 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail("User tidak ditemukan", 404);

  const updated = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, email: true, role: true, updatedAt: true },
  });

  return ok(updated);
}