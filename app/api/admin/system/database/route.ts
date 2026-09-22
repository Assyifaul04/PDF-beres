// app/api/admin/system/database/route.ts
import { requireAdmin } from "@/lib/auth-guard";
import { ok } from "@/lib/api-response";
import { getDatabaseHealth } from "@/lib/queries/system";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const health = await getDatabaseHealth();
  return ok(health);
}