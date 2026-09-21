import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  );
}

export function paginated<T>(
  items: T[],
  meta: { page: number; limit: number; total: number }
) {
  return NextResponse.json({
    success: true,
    data: items,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
}