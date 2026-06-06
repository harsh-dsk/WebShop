"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Role } from "@prisma/client";
import { toast } from "sonner";

import {
  promoteUserRole,
  toggleUserBlocked,
} from "@/actions/super-admin/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ROUTES } from "@/lib/constants/routes";
// Avoid importing server-only modules into client components. Inline allowed role transitions here.
function getAllowedRoleTargets(currentRole: Role): Role[] {
  const ROLE_TRANSITIONS: Record<Role, Role[]> = {
    [Role.CUSTOMER]: [Role.ADMIN],
    [Role.ADMIN]: [Role.CUSTOMER, Role.SUPER_ADMIN],
    [Role.SUPER_ADMIN]: [Role.ADMIN],
  };

  return ROLE_TRANSITIONS[currentRole] ?? [];
}

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: Role;
  isBlocked: boolean;
  createdAt: Date;
  _count: { orders: number };
};

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="surface-card flex flex-wrap items-end gap-4 p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        const q = String(fd.get("q") ?? "").trim();
        const role = String(fd.get("role") ?? "");
        const blocked = String(fd.get("blocked") ?? "");
        if (q) params.set("q", q);
        if (role) params.set("role", role);
        if (blocked) params.set("blocked", blocked);
        startTransition(() => {
          router.push(`${ROUTES.superAdminUsers}?${params.toString()}`);
        });
      }}
    >
      <div className="min-w-[200px] flex-1 space-y-2">
        <Label htmlFor="q">Search</Label>
        <Input id="q" name="q" defaultValue={searchParams.get("q") ?? ""} placeholder="Email or name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue={searchParams.get("role") ?? ""}>
          <option value="">All roles</option>
          <option value={Role.CUSTOMER}>Customer</option>
          <option value={Role.ADMIN}>Admin</option>
          <option value={Role.SUPER_ADMIN}>Super Admin</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="blocked">Status</Label>
        <Select id="blocked" name="blocked" defaultValue={searchParams.get("blocked") ?? ""}>
          <option value="">All</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </Select>
      </div>
      <Button type="submit" loading={pending}>
        {pending ? "Filtering…" : "Filter"}
      </Button>
    </form>
  );
}

function RoleActions({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: Role;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const targets = getAllowedRoleTargets(currentRole);

  if (targets.length === 0) {
    return (
      <span className="inline-flex h-9 shrink-0 items-center text-xs text-muted-foreground">
        —
      </span>
    );
  }

  return (
    <>
      {targets.map((role) => (
        <Button
          key={role}
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0"
          loading={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await promoteUserRole(userId, role);
              if (result.error) toast.error(result.error);
              else {
                toast.success(`Role updated to ${role}`);
                router.refresh();
              }
            });
          }}
        >
          {pending ? "Updating…" : `→ ${role.replace("_", " ")}`}
        </Button>
      ))}
    </>
  );
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="Try adjusting your search or filter criteria."
      />
    );
  }

  return (
    <div className="data-table-wrap">
      <div className="data-table-scroll">
        <table className="data-table min-w-[720px]">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {users.map((user) => {
            const name =
              (user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ")) ||
              user.email;

            return (
              <tr key={user.id}>
                <td>
                  <Link
                    href={`${ROUTES.superAdminUsers}/${user.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td>
                  <Badge variant={user.role === "CUSTOMER" ? "muted" : "default"}>
                    {user.role}
                  </Badge>
                </td>
                <td>{user._count.orders}</td>
                <td>
                  {user.isBlocked ? (
                    <Badge variant="danger">Blocked</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </td>
                <td className="align-middle">
                  <div className="flex min-h-9 flex-wrap items-center gap-2">
                    <RoleActions userId={user.id} currentRole={user.role} />
                    <Button
                      type="button"
                      size="sm"
                      variant={user.isBlocked ? "outline" : "ghost"}
                      className="shrink-0"
                      loading={pending}
                      onClick={() => {
                        startTransition(async () => {
                          const result = await toggleUserBlocked(
                            user.id,
                            !user.isBlocked,
                          );
                          if (result.error) toast.error(result.error);
                          else {
                            toast.success(
                              user.isBlocked ? "User unblocked" : "User blocked",
                            );
                            router.refresh();
                          }
                        });
                      }}
                    >
                      {pending
                        ? "Updating…"
                        : user.isBlocked
                          ? "Unblock"
                          : "Block"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
    </div>
  );
}
