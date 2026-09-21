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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Quota & Activity | Admin",
};

export default async function QuotaPage() {
  // Ambil semua user dengan quota tertinggi + aktivitas
  const [topStorage, topTasks, activeSessions] = await Promise.all([
    prisma.user.findMany({
      orderBy: { usedBytes: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        usedBytes: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { taskCount: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        taskCount: true,
      },
    }),
    prisma.session.groupBy({
      by: ["userId"],
      _count: { _all: true },
      orderBy: { _count: { userId: "desc" } },
      take: 10,
    }),
  ]);

  // Enrich sessions dengan data user
  const sessionUsers = await prisma.user.findMany({
    where: { id: { in: activeSessions.map((s) => s.userId) } },
    select: { id: true, name: true, email: true, plan: true },
  });

  const sessionMap = new Map(sessionUsers.map((u) => [u.id, u]));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quota & Activity</h1>
        <p className="text-muted-foreground">
          Pantau penggunaan storage, task, dan sesi login user
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Storage */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStorage.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.name ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.plan === "PREMIUM" ? "default" : "outline"}>
                        {u.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatBytes(Number(u.usedBytes))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Task Count</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTasks.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.name ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.plan === "PREMIUM" ? "default" : "outline"}>
                        {u.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.taskCount.toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.map((s) => {
                const u = sessionMap.get(s.userId);
                return (
                  <TableRow key={s.userId}>
                    <TableCell className="font-medium">
                      {u?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u?.email}
                    </TableCell>
                    <TableCell className="text-right">
                      {s._count._all}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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