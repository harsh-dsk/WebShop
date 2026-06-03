import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomepageForm, StoreInfoForm } from "@/components/super-admin/settings-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteSettingsRecord } from "@/lib/services/site-settings.service";

export default async function SuperAdminSettingsPage() {
  const settings = await getSiteSettingsRecord();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Site settings"
        description="Store information, contact details, social links, and homepage content."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store information</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreInfoForm settings={settings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Homepage CMS</CardTitle>
        </CardHeader>
        <CardContent>
          <HomepageForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
