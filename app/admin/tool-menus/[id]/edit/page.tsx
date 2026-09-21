import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ToolMenuForm } from "@/components/admin/tool-menus/tool-menu-form";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const menu = await prisma.toolMenu.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: menu ? `Edit ${menu.title} | Admin` : "Edit Menu | Admin" };
}

export default async function EditToolMenuPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const [menu, categories] = await Promise.all([
    prisma.toolMenu.findUnique({ where: { id } }),
    prisma.toolCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!menu) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Menu</h1>
        <p className="text-muted-foreground">
          Update informasi ToolMenu: {menu.title}
        </p>
      </div>

      <ToolMenuForm
        mode="edit"
        categories={categories}
        initialData={{
          id: menu.id,
          categoryId: menu.categoryId,
          title: menu.title,
          slug: menu.slug,
          description: menu.description ?? "",
          href: menu.href,
          icon: menu.icon ?? "",
          order: menu.order,
          isActive: menu.isActive,
          toolType: menu.toolType,
        }}
      />
    </div>
  );
}