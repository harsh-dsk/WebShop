import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InventoryTable } from "@/components/admin/inventory-table";
import { getInventoryRows } from "@/lib/services/admin.service";

export default async function AdminInventoryPage() {
  const products = await getInventoryRows();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Inventory"
        description="Monitor stock levels. Products with variants show per-variant quantities."
      />
      <InventoryTable products={products} />
    </div>
  );
}
