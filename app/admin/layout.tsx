// app/admin/layout.tsx
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { requireAdminPage } from "@/lib/auth-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col w-full min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-sm font-semibold tracking-tight">
              PDF Admin
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}