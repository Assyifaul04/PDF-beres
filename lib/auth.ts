// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  callbacks: {
    // ✅ JWT: simpan id & role ke token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },

    // ✅ Session: ekspos id & role ke client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },

    // ✅ Redirect setelah login/register
    async redirect({ url, baseUrl }) {
      // Jika url relatif (dari halaman yang dilindungi), gabung dengan baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Jika url masih dalam domain yang sama, izinkan
      if (new URL(url).origin === baseUrl) return url;
      // Default: kembalikan ke baseUrl (nanti di-handle middleware)
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};