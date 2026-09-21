import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/tool-menus/category-form";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const category = await prisma.toolCategory.findUnique({
    where: { id },
    select: { name: true },
  });
  return {
    title: category
      ? `Edit ${category.name} | Admin`
      : "Edit Kategori | Admin",
  };
}

export default async function EditCategoryPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const category = await prisma.toolCategory.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Kategori</h1>
        <p className="text-muted-foreground">
          Update informasi ToolCategory: {category.name}
        </p>
      </div>

      <CategoryForm
        mode="edit"
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          order: category.order,
          isActive: category.isActive,
        }}
      />
    </div>
  );
}