// app/api/admin/files/route.ts
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { getFilesList } from "@/lib/queries/files";
import { StorageProvider, MigrationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const providerParam = searchParams.get("provider");
  const statusParam = searchParams.get("status");
  const page = Number(searchParams.get("page")) || 1;

  // Validasi enum
  const provider =
    providerParam &&
    Object.values(StorageProvider).includes(providerParam as StorageProvider)
      ? (providerParam as StorageProvider)
      : undefined;

  const migrationStatus =
    statusParam &&
    Object.values(MigrationStatus).includes(statusParam as MigrationStatus)
      ? (statusParam as MigrationStatus)
      : undefined;

  const result = await getFilesList({
    q,
    provider,
    migrationStatus,
    page,
    perPage: 20,
  });

  // BigInt → string untuk JSON
  const serialized = {
    ...result,
    items: result.items.map((f) => ({
      ...f,
      sizeBytes: f.sizeBytes.toString(),
    })),
  };

  return ok(serialized);
}

// DELETE massal? Bisa ditambahkan nanti.
export async function POST(_req: NextRequest) {
  return fail("Method not allowed", 405);
}