// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // ==========================================
    // ADMIN ROUTING
    // ==========================================

    // Admin buka "/" → redirect ke /admin/dashboard
    if (pathname === "/" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Admin buka /user/* → redirect ke /admin/dashboard
    if (pathname.startsWith("/user") && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // ==========================================
    // USER ROUTING
    // ==========================================

    // User biasa (bukan admin) buka /admin/* → redirect ke "/"
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ==========================================
    // ANTI-CACHE (untuk route protected)
    // ==========================================
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

        // Public paths — boleh diakses tanpa login
        const publicPaths = ["/", "/login", "/signup", "/terms", "/privacy"];
        const isPublic = publicPaths.some(
          (p) => pathname === p || pathname.startsWith(p + "/")
        );
        if (isPublic) return true;

        // Wajib login
        if (!token) return false;

        // /admin/* hanya untuk ADMIN
        if (pathname.startsWith("/admin")) {
          return token.role === "ADMIN";
        }

        // Route lain yang butuh login → user biasa boleh
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
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};