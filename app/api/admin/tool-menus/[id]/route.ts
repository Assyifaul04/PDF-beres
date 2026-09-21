import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

const updateSchema = z.object({
  categoryId: z.string().optional(),
  title: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  href: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  toolType: z.string().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const menu = await prisma.toolMenu.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!menu) return fail("Menu tidak ditemukan", 404);

  return ok(menu);
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Data tidak valid", 422, parsed.error.flatten());
  }

  const existing = await prisma.toolMenu.findUnique({ where: { id } });
  if (!existing) return fail("Menu tidak ditemukan", 404);

  const updated = await prisma.toolMenu.update({
    where: { id },
    data: parsed.data as any,
  });

  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.toolMenu.findUnique({ where: { id } });
  if (!existing) return fail("Menu tidak ditemukan", 404);

  await prisma.toolMenu.delete({ where: { id } });
  return ok({ id, deleted: true });
}