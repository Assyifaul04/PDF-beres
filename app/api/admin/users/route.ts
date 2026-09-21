import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { userListQuerySchema } from "@/lib/validators/user";
import { ok, fail, paginated } from "@/lib/api-response";

// ==========================================
// GET /api/admin/users
// Query: role, plan, q, page, limit, sort, order
// ==========================================
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const parsed = userListQuerySchema.safeParse({
    role: searchParams.get("role") ?? undefined,
    plan: searchParams.get("plan") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    order: searchParams.get("order") ?? undefined,
  });

  if (!parsed.success) {
    return fail("Query tidak valid", 400, parsed.error.flatten());
  }

  const { role, plan, q, page, limit, sort, order } = parsed.data;

  const where = {
    ...(role && { role }),
    ...(plan && { plan }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
        usedBytes: true,
        taskCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { files: true, tasks: true, sessions: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // BigInt tidak bisa di-serialize JSON → konversi ke string
  const serialized = users.map((u) => ({
    ...u,
    usedBytes: u.usedBytes.toString(),
  }));

  return paginated(serialized, { page, limit, total });
}

// ==========================================
// POST /api/admin/users
// Body: { name, email, role?, plan? }
// ==========================================
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, email, role, plan } = body;

    if (!email) return fail("Email wajib diisi", 422);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("Email sudah terdaftar", 409);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role ?? "USER",
        plan: plan ?? "FREE",
      },
    });

    return ok(
      { ...user, usedBytes: user.usedBytes.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/admin/users]", err);
    return fail("Gagal membuat user", 500);
  }
}