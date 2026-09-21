import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ToolMenusRowActions,
} from "./tool-menus-row-actions";

interface Props {
  categoryId?: string;
  isActive?: string;
  query?: string;
  page: number;
}

const PAGE_SIZE = 20;

export async function ToolMenusTable({
  categoryId,
  isActive,
  query,
  page,
}: Props) {
  const where = {
    ...(categoryId && { categoryId }),
    ...(isActive && { isActive: isActive === "true" }),
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { slug: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
      ],
    }),
  };

  const [menus, total] = await Promise.all([
    prisma.toolMenu.findMany({
      where,
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        href: true,
        icon: true,
        order: true,
        isActive: true,
        toolType: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.toolMenu.count({ where }),
  ]);

  if (menus.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Tidak ada menu ditemukan</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Menu</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tool Type</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.map((menu) => (
              <TableRow key={menu.id}>
                <TableCell className="text-center font-mono text-sm">
                  {menu.order}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {menu.icon && (
                      <div className="flex h-9 w-9 items-center justify-center rounded bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={menu.icon}
                          alt=""
                          className="h-5 w-5 object-contain"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{menu.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {menu.href}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{menu.category.name}</Badge>
                </TableCell>
                <TableCell>
                  {menu.toolType ? (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {menu.toolType}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={menu.isActive ? "default" : "outline"}
                  >
                    {menu.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ToolMenusRowActions
                    id={menu.id}
                    isActive={menu.isActive}
                    title={menu.title}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={total}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  total,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
}) {
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages} ({total.toLocaleString("id-ID")}{" "}
        menu)
      </p>
      <div className="flex gap-2">
        {prevDisabled ? (
          <span className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium opacity-50">
            Sebelumnya
          </span>
        ) : (
          <Link
            href={`?page=${currentPage - 1}`}
            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            Sebelumnya
          </Link>
        )}

        {nextDisabled ? (
          <span className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium opacity-50">
            Berikutnya
          </span>
        ) : (
          <Link
            href={`?page=${currentPage + 1}`}
            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            Berikutnya
          </Link>
        )}
      </div>
    </div>
  );
}