import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const categories = await prisma.toolCategory.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { menus: true } } },
  });

  return ok(categories);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Data tidak valid", 422, parsed.error.flatten());
  }

  const dup = await prisma.toolCategory.findFirst({
    where: {
      OR: [{ slug: parsed.data.slug }, { name: parsed.data.name }],
    },
  });
  if (dup) return fail("Nama atau slug sudah dipakai", 409);

  const category = await prisma.toolCategory.create({
    data: parsed.data,
  });

  return ok(category, { status: 201 });
}