import { prisma } from "@/lib/prisma";

export type MenuItemData = {
  id: string;
  href: string;
  label: string;
  icon: string | null;
  toolType: string | null;
};

export type MenuColumnData = {
  id: string;
  title: string;
  slug: string;
  items: MenuItemData[];
};

/**
 * Ambil kategori + menu aktif untuk navbar dropdown.
 * Hanya kategori & menu dengan isActive = true.
 */
export async function getActiveMenuColumns(): Promise<MenuColumnData[]> {
  const categories = await prisma.toolCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      menus: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          href: true,
          icon: true,
          toolType: true,
        },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    title: cat.name,
    slug: cat.slug,
    items: cat.menus.map((menu) => ({
      id: menu.id,
      href: menu.href,
      label: menu.title,
      icon: menu.icon,
      toolType: menu.toolType,
    })),
  }));
}

/**
 * Ambil menu aktif berdasarkan slug kategori.
 * Berguna kalau ingin dropdown spesifik per kategori.
 */
export async function getMenuColumnsByCategory(
  categorySlugs: string[]
): Promise<MenuColumnData[]> {
  const categories = await prisma.toolCategory.findMany({
    where: {
      isActive: true,
      slug: { in: categorySlugs },
    },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      menus: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          href: true,
          icon: true,
          toolType: true,
        },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    title: cat.name,
    slug: cat.slug,
    items: cat.menus.map((menu) => ({
      id: menu.id,
      href: menu.href,
      label: menu.title,
      icon: menu.icon,
      toolType: menu.toolType,
    })),
  }));
}