import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function PageHeaderSkeleton({ narrow = false }: { narrow?: boolean }) {
  return (
    <div className={cn("space-y-3", narrow ? "max-w-3xl" : undefined)}>
      <Skeleton className="h-9 w-48 sm:h-10 sm:w-56" />
      <Skeleton className="h-5 w-full max-w-md" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="animate-fade-in">
      <section className="border-b border-border bg-card">
        <div className="page-container py-16 sm:py-24 lg:py-28">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-12 w-full max-w-2xl sm:h-14" />
          <Skeleton className="mt-4 h-12 w-full max-w-xl" />
          <Skeleton className="mt-5 h-6 w-full max-w-lg" />
          <div className="mt-10 flex gap-3">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
      </section>
      <section className="page-container py-12 sm:py-16">
        <div className="flex items-end justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </section>
      <section className="page-container pb-16 sm:pb-20">
        <Skeleton className="h-8 w-40" />
        <div className="mt-8">
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    </div>
  );
}

export function ProductListingSkeleton() {
  return (
    <div className="page-container py-10 sm:py-12 animate-fade-in">
      <PageHeaderSkeleton />
      <div className="mt-8 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="page-container py-10 sm:py-12 animate-fade-in">
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-40" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="page-container py-10 sm:py-12 animate-fade-in">
      <PageHeaderSkeleton />
      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2 surface-card divide-y divide-border px-4 sm:px-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-6 sm:gap-5">
              <Skeleton className="h-24 w-24 shrink-0 rounded-lg sm:h-28 sm:w-28" />
              <div className="flex flex-1 flex-col gap-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-24" />
                <div className="mt-auto flex items-center gap-3">
                  <Skeleton className="h-9 w-28 rounded-lg" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="surface-elevated h-fit p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-5 h-5 w-full" />
          <Skeleton className="mt-6 h-11 w-full rounded-lg" />
        </aside>
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="page-container max-w-3xl py-10 sm:py-12 animate-fade-in">
      <PageHeaderSkeleton narrow />
      <div className="mt-8 space-y-6">
        <div className="checkout-section">
          <div className="checkout-section-header">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <div className="checkout-section-body space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="h-11 w-full max-w-md rounded-lg" />
      </div>
    </div>
  );
}

export function WishlistSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-fade-in">
      <PageHeaderSkeleton />
      <ul className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-9 w-20 rounded-lg" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-fade-in">
      <PageHeaderSkeleton />
      <ul className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="rounded-xl border-2 border-border bg-card p-6">
            <div className="flex justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="ml-auto h-6 w-20" />
                <Skeleton className="ml-auto h-6 w-16" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-fade-in">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-10 w-56" />
      <div className="mt-8 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function AddressesSkeleton() {
  return (
    <div className="page-container max-w-3xl py-10 sm:py-12 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeaderSkeleton narrow />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <li key={i} className="sm:col-span-2 lg:col-span-1">
            <Skeleton className="h-52 w-full rounded-xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}

export function StatsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface-card p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeaderSkeleton narrow />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <StatsGridSkeleton count={8} />
      <StatsGridSkeleton count={3} />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeaderSkeleton narrow />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <div className="data-table-wrap">
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SuperAdminDashboardSkeleton() {
  return <AdminDashboardSkeleton />;
}

export function ActivityLogSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeaderSkeleton narrow />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <AdminTableSkeleton rows={6} />
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeaderSkeleton narrow />
      <StatsGridSkeleton count={4} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm animate-fade-in">
      <Skeleton className="mx-auto h-8 w-32" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
