import { ShopFooter } from "@/components/layout/shop-footer";
import { ShopHeader } from "@/components/layout/shop-header";
import { PageTransition } from "@/components/providers/page-transition";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <ShopFooter />
    </div>
  );
}
