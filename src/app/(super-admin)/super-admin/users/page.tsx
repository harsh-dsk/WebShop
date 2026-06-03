import { Role } from "@prisma/client";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UserFilters, UsersTable } from "@/components/super-admin/user-management";
import { listUsers } from "@/lib/services/user-management.service";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    blocked?: string;
  }>;
};

export default async function SuperAdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const role =
    params.role && Object.values(Role).includes(params.role as Role)
      ? (params.role as Role)
      : undefined;
  const blocked =
    params.blocked === "true"
      ? true
      : params.blocked === "false"
        ? false
        : undefined;

  const users = await listUsers({
    search: params.q,
    role,
    blocked,
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Users"
        description="Search, filter, promote roles, and block accounts."
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading filters…</p>}>
        <UserFilters />
      </Suspense>
      <UsersTable users={users} />
    </div>
  );
}
