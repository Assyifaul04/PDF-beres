import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";

// ==========================================
// GET /api/admin/users/stats
// ==========================================
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [total, admins, premium, free, agg, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { plan: "PREMIUM" } }),
        prisma.user.count({ where: { plan: "FREE" } }),
        prisma.user.aggregate({
          _sum: { usedBytes: true, taskCount: true },
          _avg: { taskCount: true },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return ok({
      total,
      admins,
      premium,
      free,
      newThisWeek: recentUsers,
      totalStorageBytes: (agg._sum.usedBytes ?? BigInt(0)).toString(),
      totalTasks: agg._sum.taskCount ?? 0,
      avgTasksPerUser: Math.round(agg._avg.taskCount ?? 0),
    });
  } catch (err) {
    console.error("[GET /api/admin/users/stats]", err);
    return fail("Gagal memuat statistik", 500);
  }
}