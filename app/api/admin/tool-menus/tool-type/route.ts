import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";

const mappingSchema = z.object({
  mappings: z.array(
    z.object({
      id: z.string(),
      toolType: z.string().nullable(),
    })
  ),
});

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = mappingSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Payload tidak valid", 422, parsed.error.flatten());
  }

  const { mappings } = parsed.data;

  await prisma.$transaction(
    mappings.map((m) =>
      prisma.toolMenu.update({
        where: { id: m.id },
        data: { toolType: m.toolType as any },
      })
    )
  );

  return ok({ updated: mappings.length });
}