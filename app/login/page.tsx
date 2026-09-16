import { LoginForm } from "@/components/login/login-form";
import { GalleryVerticalEndIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    // Admin → /dashboard, User biasa → / (landing)
    const target =
      session.user.role === "ADMIN" ? "/dashboard" : "/";
    redirect(target);
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            Beres
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Panel kanan — logo lebih kecil & di tengah */}
      <div className="relative hidden items-center justify-center bg-muted lg:flex">
        <Image
          src="/image/Logo Beres.png"
          alt="Beres"
          width={400}
          height={400}
          priority
          className="h-auto w-1/2 max-w-[400px] object-contain dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}