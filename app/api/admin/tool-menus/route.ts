import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";

const createSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  href: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  toolType: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const isActive = searchParams.get("isActive");
  const q = searchParams.get("q") ?? undefined;

  const menus = await prisma.toolMenu.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(isActive !== null && { isActive: isActive === "true" }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    include: { category: { select: { id: true, name: true } } },
  });

  return ok(menus);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Data tidak valid", 422, parsed.error.flatten());
  }

  const existing = await prisma.toolMenu.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) return fail("Slug sudah dipakai", 409);

  const menu = await prisma.toolMenu.create({
    data: parsed.data as any,
  });

  return ok(menu, { status: 201 });
}