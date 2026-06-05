"use client";

import { Role } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  ACTIVITY_ACTION_OPTIONS,
  ActivityEntityType,
} from "@/lib/activity-log/actions";
import { ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const ENTITY_OPTIONS = [
  { value: "", label: "All entities" },
  { value: ActivityEntityType.USER, label: "User" },
  { value: ActivityEntityType.ORDER, label: "Order" },
  { value: ActivityEntityType.PRODUCT, label: "Product" },
  { value: ActivityEntityType.PRODUCT_VARIANT, label: "Product variant" },
  { value: ActivityEntityType.SITE_SETTINGS, label: "Site settings" },
];

export function ActivityLogFilters() {
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
        const action = String(fd.get("action") ?? "");
        const role = String(fd.get("role") ?? "");
        const entityType = String(fd.get("entityType") ?? "");
        if (q) params.set("q", q);
        if (action) params.set("action", action);
        if (role) params.set("role", role);
        if (entityType) params.set("entityType", entityType);
        startTransition(() => {
          router.push(`${ROUTES.superAdminActivity}?${params.toString()}`);
        });
      }}
    >
      <div className="min-w-[200px] flex-1 space-y-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="User, action, entity ID…"
        />
      </div>
      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="action">Action</Label>
        <Select id="action" name="action" defaultValue={searchParams.get("action") ?? ""}>
          <option value="">All actions</option>
          {ACTIVITY_ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-full space-y-2 sm:w-40">
        <Label htmlFor="role">User role</Label>
        <Select id="role" name="role" defaultValue={searchParams.get("role") ?? ""}>
          <option value="">All roles</option>
          <option value={Role.CUSTOMER}>Customer</option>
          <option value={Role.ADMIN}>Admin</option>
          <option value={Role.SUPER_ADMIN}>Super Admin</option>
        </Select>
      </div>
      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="entityType">Entity</Label>
        <Select
          id="entityType"
          name="entityType"
          defaultValue={searchParams.get("entityType") ?? ""}
        >
          {ENTITY_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" loading={pending}>
        {pending ? "Filtering…" : "Apply filters"}
      </Button>
      {(searchParams.get("q") ||
        searchParams.get("action") ||
        searchParams.get("role") ||
        searchParams.get("entityType")) && (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => {
            startTransition(() => {
              router.push(ROUTES.superAdminActivity);
            });
          }}
        >
          Clear
        </Button>
      )}
    </form>
  );
}
