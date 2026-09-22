// app/api/admin/system/logs/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { getLogsList } from "@/lib/queries/system";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const result = await getLogsList({
    q: searchParams.get("q") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    action: searchParams.get("action") ?? undefined,
    page: Number(searchParams.get("page")) || 1,
  });

  return ok(result);
}

// DELETE — cleanup logs (by age / level)
const cleanupSchema = z.object({
  olderThanDays: z.number().int().min(1).max(365).optional(),
  level: z.string().optional(),
  action: z.string().optional(),
});

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = cleanupSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Data tidak valid", 422, parsed.error.flatten());
  }

  const { olderThanDays, level, action } = parsed.data;

  const where: any = {};
  if (olderThanDays) {
    where.createdAt = {
      lt: new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000),
    };
  }
  if (level) where.level = level;
  if (action) where.action = action;

  const result = await prisma.systemLog.deleteMany({ where });

  return ok({
    deleted: result.count,
    filters: { olderThanDays, level, action },
  });
}