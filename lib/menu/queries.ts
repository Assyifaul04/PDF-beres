import { prisma } from "@/lib/prisma";

export type LandingToolItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  href: string;
  iconName: string | null;
  toolType: string | null;
};

export type LandingToolGroup = {
  id: string;
  title: string;
  hint: string;
  tools: LandingToolItem[];
};

/**
 * Ambil kategori + menu aktif untuk grid di landing page.
 * Hanya menampilkan kategori & menu dengan isActive = true.
 */
export async function getLandingToolGroups(): Promise<LandingToolGroup[]> {
  const categories = await prisma.toolCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      menus: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          href: true,
          icon: true,
          toolType: true,
        },
      },
    },
  });

  return categories
    .filter((cat) => cat.menus.length > 0)
    .map((cat) => ({
      id: cat.id,
      title: cat.name,
      hint: cat.description ?? "",
      tools: cat.menus.map((menu) => ({
        id: menu.id,
        slug: menu.slug,
        title: menu.title,
        description: menu.description ?? "",
        href: menu.href,
        iconName: menu.icon,
        toolType: menu.toolType,
      })),
    }));
}