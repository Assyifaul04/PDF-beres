import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar session={session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}