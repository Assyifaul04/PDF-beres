import { prisma } from "@/lib/prisma";
import { OrderingBoard } from "@/components/admin/tool-menus/ordering-board";

export const metadata = {
  title: "Ordering | Admin",
};

export default async function OrderingPage() {
  const categories = await prisma.toolCategory.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      order: true,
      isActive: true,
      menus: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          order: true,
          isActive: true,
          href: true,
          icon: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ordering</h1>
        <p className="text-muted-foreground">
          Drag & drop untuk mengatur urutan kategori dan menu
        </p>
      </div>

      <OrderingBoard initialCategories={categories} />
    </div>
  );
}