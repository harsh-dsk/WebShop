import { CategoryForm } from "@/components/admin/category-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">New category</h1>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Category details</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
