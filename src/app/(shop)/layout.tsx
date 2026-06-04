import { ShopFooter } from "@/components/layout/shop-footer";
import { ShopHeader } from "@/components/layout/shop-header";
import { ShopToaster } from "@/components/providers/shop-toaster";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ShopToaster />
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <ShopFooter />
    </div>
  );
}
