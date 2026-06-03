import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UsersTable } from "@/components/super-admin/user-management";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getUserById } from "@/lib/services/user-management.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SuperAdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) notFound();

  const displayName =
    (user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ")) ||
    user.email;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={displayName}
        description={user.email}
        actions={
          <Link href={ROUTES.superAdminUsers} className="text-sm text-accent hover:underline">
            ← All users
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Role: </span>
            <Badge>{user.role}</Badge>
          </p>
          <p>
            <span className="text-muted-foreground">Status: </span>
            {user.isBlocked ? (
              <Badge variant="danger">Blocked</Badge>
            ) : (
              <Badge variant="default">Active</Badge>
            )}
          </p>
          <p>
            <span className="text-muted-foreground">Phone: </span>
            {user.phone ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Joined: </span>
            {user.createdAt.toLocaleDateString()}
          </p>
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Address: </span>
            {[user.address, user.city, user.state, user.postalCode]
              .filter(Boolean)
              .join(", ") || "—"}
          </p>
        </CardContent>
      </Card>

      <UsersTable
        users={[
          {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt,
            _count: user._count,
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent orders ({user._count.orders})</CardTitle>
        </CardHeader>
        <CardContent>
          {user.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {user.orders.map((order) => (
                <li key={order.id} className="flex justify-between py-2">
                  <Link href={`${ROUTES.adminOrders}/${order.id}`} className="font-medium hover:text-primary">
                    {order.orderNumber}
                  </Link>
                  <span>
                    {order.status} · {formatPrice(Number(order.total))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
