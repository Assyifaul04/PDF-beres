// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin yang buka "/" → redirect ke /dashboard
    if (pathname === "/" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin yang buka /user/* → redirect ke /dashboard (opsional)
    if (pathname.startsWith("/user") && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // User biasa yang buka /admin/* → redirect ke "/"
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Anti-cache
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

        // Public paths
        const publicPaths = ["/", "/login", "/signup", "/terms", "/privacy"];
        const isPublic = publicPaths.some(
          (p) => pathname === p || pathname.startsWith(p + "/")
        );
        if (isPublic) return true;

        // Wajib login
        if (!token) return false;

        // /dashboard hanya untuk ADMIN
        if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
          return token.role === "ADMIN";
        }

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