import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrandingForm } from "@/components/super-admin/settings-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteSettingsRecord } from "@/lib/services/site-settings.service";

export default async function SuperAdminBrandingPage() {
  const settings = await getSiteSettingsRecord();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Branding"
        description="Upload logo and favicon via Cloudinary. Used in header and browser tab."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo & favicon</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandingForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
