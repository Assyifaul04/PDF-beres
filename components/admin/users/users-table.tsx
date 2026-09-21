import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  role?: "USER" | "ADMIN";
  plan?: "FREE" | "PREMIUM";
  query?: string;
  page: number;
}

const PAGE_SIZE = 20;

export async function UsersTable({ role, plan, query, page }: Props) {
  const where = {
    ...(role && { role }),
    ...(plan && { plan }),
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { email: { contains: query, mode: "insensitive" as const } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
        usedBytes: true,
        taskCount: true,
        createdAt: true,
        _count: {
          select: { files: true, tasks: true, sessions: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Tidak ada user ditemukan</p>
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
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Storage</TableHead>
              <TableHead className="text-right">Tasks</TableHead>
              <TableHead className="text-right">Files</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback>
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {user.name ?? "Tanpa Nama"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.plan === "PREMIUM" ? "default" : "outline"}
                  >
                    {user.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatBytes(Number(user.usedBytes))}
                </TableCell>
                <TableCell className="text-right">
                  {user._count.tasks.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  {user._count.files.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Detail
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
        user)
      </p>
      <div className="flex gap-2">
        {prevDisabled ? (
          <Button variant="outline" size="sm" disabled>
            Sebelumnya
          </Button>
        ) : (
          <Link
            href={`?page=${currentPage - 1}`}
            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sebelumnya
          </Link>
        )}

        {nextDisabled ? (
          <Button variant="outline" size="sm" disabled>
            Berikutnya
          </Button>
        ) : (
          <Link
            href={`?page=${currentPage + 1}`}
            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Berikutnya
          </Link>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}