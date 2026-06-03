import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ThemeForm } from "@/components/super-admin/settings-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteSettingsRecord } from "@/lib/services/site-settings.service";

export default async function SuperAdminThemePage() {
  const settings = await getSiteSettingsRecord();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Theme"
        description="Customize colors applied across the storefront. Changes apply after save."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Color palette</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
