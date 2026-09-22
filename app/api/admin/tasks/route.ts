// app/api/admin/tasks/route.ts
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { ok } from "@/lib/api-response";
import { getTasksList } from "@/lib/queries/tasks";
import { TaskStatus, ToolType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const statusParam = searchParams.get("status");
  const toolTypeParam = searchParams.get("toolType");
  const page = Number(searchParams.get("page")) || 1;

  // Validasi enum
  const status =
    statusParam && Object.values(TaskStatus).includes(statusParam as TaskStatus)
      ? (statusParam as TaskStatus)
      : undefined;

  const toolType =
    toolTypeParam && Object.values(ToolType).includes(toolTypeParam as ToolType)
      ? (toolTypeParam as ToolType)
      : undefined;

  const result = await getTasksList({
    q,
    status,
    toolType,
    page,
    perPage: 20,
  });

  return ok(result);
}