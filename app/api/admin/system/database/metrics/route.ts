// app/api/admin/system/database/metrics/route.ts
import { requireAdmin } from "@/lib/auth-guard";
import { ok } from "@/lib/api-response";
import {
  getDatabaseHealth,
  getLogsTimeline,
  getTableStats,
  getHourlyActivity,
  getLogsStats,
} from "@/lib/queries/system";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [health, timeline, tableStats, hourly, logsStats] = await Promise.all([
    getDatabaseHealth(),
    getLogsTimeline(7),
    getTableStats(),
    getHourlyActivity(),
    getLogsStats(),
  ]);

  return ok({
    health,
    timeline,
    tableStats,
    hourly,
    logsStats,
    timestamp: new Date().toISOString(),
  });
}