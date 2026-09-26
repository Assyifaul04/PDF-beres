// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin routing
    if (pathname === "/" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (pathname.startsWith("/user") && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ⚠️ KRITIS: JANGAN intercept /api/* — biarkan route handle sendiri
    // Middleware anti-cache akan merusak response file (PDF, dll.)
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Anti-cache hanya untuk halaman (HTML)
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ✅ Izinkan SEMUA API route — mereka handle auth sendiri
        if (pathname.startsWith("/api/")) return true;

        const publicPaths = ["/", "/login", "/signup", "/terms", "/privacy"];
        const isPublic = publicPaths.some(
          (p) => pathname === p || pathname.startsWith(p + "/")
        );
        if (isPublic) return true;

        if (!token) return false;

        if (pathname.startsWith("/admin")) {
          return token.role === "ADMIN";
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    // ⚠️ WAJIB: exclude "api" (bukan hanya "api/auth") agar /api/files bebas
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};