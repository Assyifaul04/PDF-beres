import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";

const reorderSchema = z.object({
  categories: z.array(
    z.object({ id: z.string(), order: z.number().int() })
  ),
  menus: z.array(z.object({ id: z.string(), order: z.number().int() })),
});

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Payload tidak valid", 422, parsed.error.flatten());
  }

  const { categories, menus } = parsed.data;

  await prisma.$transaction([
    ...categories.map((c) =>
      prisma.toolCategory.update({
        where: { id: c.id },
        data: { order: c.order },
      })
    ),
    ...menus.map((m) =>
      prisma.toolMenu.update({
        where: { id: m.id },
        data: { order: m.order },
      })
    ),
  ]);

  return ok({ updated: categories.length + menus.length });
}