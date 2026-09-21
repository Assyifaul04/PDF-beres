import { prisma } from "@/lib/prisma";
import { ToolMenuForm } from "@/components/admin/tool-menus/tool-menu-form";

export const metadata = {
  title: "Tambah Menu Baru | Admin",
};

export default async function NewToolMenuPage() {
  const categories = await prisma.toolCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Menu Baru</h1>
        <p className="text-muted-foreground">
          Buat ToolMenu baru dan hubungkan ke kategori
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada kategori. Buat kategori terlebih dahulu di{" "}
            <a
              href="/admin/tool-menus/categories/new"
              className="font-medium text-primary underline"
            >
              sini
            </a>
            .
          </p>
        </div>
      ) : (
        <ToolMenuForm mode="create" categories={categories} />
      )}
    </div>
  );
}