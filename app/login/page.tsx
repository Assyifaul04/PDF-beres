// app/login/page.tsx
import { LoginForm } from "@/components/login/login-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Admin → /admin/dashboard, User biasa → / (landing)
    const target = session.user.role === "ADMIN" ? "/admin/dashboard" : "/";
    redirect(target);
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* ================= KIRI: FORM ================= */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo di atas form */}
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Image
              src="/image/Logo Beres.png"
              alt="Beres"
              width={120}
              height={120}
              priority
              className="h-14 w-auto object-contain"
            />
          </a>
        </div>

        {/* Form login */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* ================= KANAN: LOGO BESAR ================= */}
      <div className="relative hidden items-center justify-center bg-muted lg:flex">
        <Image
          src="/image/Logo Beres.png"
          alt="Beres"
          width={400}
          height={400}
          priority
          className="h-auto w-1/2 max-w-[400px] object-contain"
        />
      </div>
    </div>
  );
}
