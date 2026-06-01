import { CategoryForm } from "@/components/admin/category-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function NewCategoryPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="New category"
        description="Categories group products and define optional custom attributes."
      />
      <CategoryForm />
    </div>
  );
}
