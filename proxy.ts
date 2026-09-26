// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Ambil token dari JWT
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = (token?.role as string | undefined) ?? undefined;

  // -------- Admin routing --------
  if (pathname === "/" && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
  if (pathname.startsWith("/user") && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // -------- Auth guard --------
  const publicPaths = ["/", "/login", "/signup", "/terms", "/privacy"];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // -------- Anti-cache untuk halaman HTML --------
  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon\\.ico|.*\\..*).*)",
  ],
};