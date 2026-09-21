import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { UsersStats } from "@/components/admin/users/users-stats";
import { UsersFilters } from "@/components/admin/users/users-filters";
import { UsersTable } from "@/components/admin/users/users-table";
import { UsersTableSkeleton } from "@/components/admin/users/users-table-skeleton";

type SearchParams = Promise<{
  role?: "USER" | "ADMIN";
  plan?: "FREE" | "PREMIUM";
  q?: string;
  page?: string;
}>;

export const metadata = {
  title: "Users | Admin",
  description: "Kelola semua user terdaftar",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Kelola semua user terdaftar, role, plan, dan quota
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<div className="h-28" />}>
        <UsersStats />
      </Suspense>

      {/* Filters */}
      <UsersFilters
        currentRole={params.role}
        currentPlan={params.plan}
        currentQuery={params.q}
      />

      {/* Table */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable
          role={params.role}
          plan={params.plan}
          query={params.q}
          page={Number(params.page) || 1}
        />
      </Suspense>
    </div>
  );
}