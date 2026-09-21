import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
      user: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, role: true, plan: true },
  });

  if (!user || user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { success: false, error: "Forbidden — admin only" },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}