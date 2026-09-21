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
import { CategoriesRowActions } from "./categories-row-actions";

export async function CategoriesTable() {
  const categories = await prisma.toolCategory.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      order: true,
      isActive: true,
      createdAt: true,
      _count: { select: { menus: true } },
    },
  });

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Belum ada kategori</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Order</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-center">Menus</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="text-center font-mono text-sm">
                {cat.order}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{cat.name}</p>
                  {cat.description && (
                    <p className="truncate text-xs text-muted-foreground max-w-md">
                      {cat.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {cat.slug}
              </TableCell>
              <TableCell className="text-center">
                {cat._count.menus.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={cat.isActive ? "default" : "outline"}>
                  {cat.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <CategoriesRowActions
                  id={cat.id}
                  isActive={cat.isActive}
                  name={cat.name}
                  menuCount={cat._count.menus}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}