import { CategoryForm } from "@/components/admin/tool-menus/category-form";

export const metadata = {
  title: "Tambah Kategori Baru | Admin",
};

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Tambah Kategori Baru
        </h1>
        <p className="text-muted-foreground">
          Buat ToolCategory baru untuk mengelompokkan menu
        </p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}