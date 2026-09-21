import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";

// ==========================================
// GET /api/admin/users/quota
// ==========================================
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [topStorage, topTasks, topSessions] = await Promise.all([
      prisma.user.findMany({
        orderBy: { usedBytes: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          usedBytes: true,
        },
      }),
      prisma.user.findMany({
        orderBy: { taskCount: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          taskCount: true,
        },
      }),
      prisma.session.groupBy({
        by: ["userId"],
        _count: { _all: true },
        orderBy: { _count: { userId: "desc" } },
        take: 10,
      }),
    ]);

    const sessionUsers = await prisma.user.findMany({
      where: { id: { in: topSessions.map((s) => s.userId) } },
      select: { id: true, name: true, email: true, plan: true },
    });

    const userMap = new Map(sessionUsers.map((u) => [u.id, u]));

    return ok({
      topStorage: topStorage.map((u) => ({
        ...u,
        usedBytes: u.usedBytes.toString(),
      })),
      topTasks,
      topSessions: topSessions.map((s) => ({
        userId: s.userId,
        count: s._count._all,
        user: userMap.get(s.userId) ?? null,
      })),
    });
  } catch (err) {
    console.error("[GET /api/admin/users/quota]", err);
    return fail("Gagal memuat quota", 500);
  }
}