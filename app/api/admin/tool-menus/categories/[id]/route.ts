import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
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

  const existing = await prisma.toolCategory.findUnique({ where: { id } });
  if (!existing) return fail("Kategori tidak ditemukan", 404);

  const updated = await prisma.toolCategory.update({
    where: { id },
    data: parsed.data,
  });

  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.toolCategory.findUnique({
    where: { id },
    include: { _count: { select: { menus: true } } },
  });
  if (!existing) return fail("Kategori tidak ditemukan", 404);

  // Cascade delete: semua ToolMenu di bawahnya akan ikut terhapus
  await prisma.toolCategory.delete({ where: { id } });

  return ok({
    id,
    deleted: true,
    deletedMenus: existing._count.menus,
  });
}