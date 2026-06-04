"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  updateBranding,
  updateHomepage,
  updateStoreInfo,
  updateTheme,
} from "@/actions/super-admin/settings";
import { MediaUploadField } from "@/components/super-admin/media-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@prisma/client";

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring/30"
      />
      {label}
    </label>
  );
}

export function StoreInfoForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateStoreInfo({}, fd);
          if (result.error) toast.error(result.error);
          else {
            toast.success("Store settings saved");
            router.refresh();
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" name="storeName" defaultValue={settings.storeName} required />
        </div>
        <div>
          <Label htmlFor="storeTagline">Tagline</Label>
          <Input id="storeTagline" name="storeTagline" defaultValue={settings.storeTagline} required />
        </div>
      </div>
      <div>
        <Label htmlFor="storeDescription">Description</Label>
        <Textarea id="storeDescription" name="storeDescription" rows={4} defaultValue={settings.storeDescription} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="supportEmail">Support email</Label>
          <Input id="supportEmail" name="supportEmail" type="email" defaultValue={settings.supportEmail} required />
        </div>
        <div>
          <Label htmlFor="supportPhone">Support phone</Label>
          <Input id="supportPhone" name="supportPhone" defaultValue={settings.supportPhone} required />
        </div>
      </div>
      <div>
        <Label htmlFor="storeAddress">Store address</Label>
        <Textarea id="storeAddress" name="storeAddress" rows={2} defaultValue={settings.storeAddress} required />
      </div>
      <p className="text-sm font-medium text-foreground">Social links</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="instagramUrl">Instagram</Label>
          <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} placeholder="https://instagram.com/..." />
        </div>
        <div>
          <Label htmlFor="facebookUrl">Facebook</Label>
          <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
        </div>
        <div>
          <Label htmlFor="linkedInUrl">LinkedIn</Label>
          <Input id="linkedInUrl" name="linkedInUrl" defaultValue={settings.linkedInUrl ?? ""} />
        </div>
        <div>
          <Label htmlFor="twitterUrl">Twitter / X</Label>
          <Input id="twitterUrl" name="twitterUrl" defaultValue={settings.twitterUrl ?? ""} />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save store settings"}
      </Button>
    </form>
  );
}

export function HomepageForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateHomepage({}, fd);
          if (result.error) toast.error(result.error);
          else {
            toast.success("Homepage saved");
            router.refresh();
          }
        });
      }}
    >
      <MediaUploadField
        label="Hero background image"
        name="heroBackgroundImage"
        value={settings.heroBackgroundImage}
        folder="hero"
      />
      <div>
        <Label htmlFor="heroEyebrow">Hero eyebrow</Label>
        <Input id="heroEyebrow" name="heroEyebrow" defaultValue={settings.heroEyebrow ?? ""} />
      </div>
      <div>
        <Label htmlFor="heroTitle">Hero title</Label>
        <Input id="heroTitle" name="heroTitle" defaultValue={settings.heroTitle} required />
      </div>
      <div>
        <Label htmlFor="heroSubtitle">Hero subtitle</Label>
        <Textarea id="heroSubtitle" name="heroSubtitle" rows={3} defaultValue={settings.heroSubtitle} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="heroPrimaryCtaLabel">Primary button text</Label>
          <Input id="heroPrimaryCtaLabel" name="heroPrimaryCtaLabel" defaultValue={settings.heroPrimaryCtaLabel} required />
        </div>
        <div>
          <Label htmlFor="heroPrimaryCtaHref">Primary button link</Label>
          <Input id="heroPrimaryCtaHref" name="heroPrimaryCtaHref" defaultValue={settings.heroPrimaryCtaHref} required />
        </div>
        <div>
          <Label htmlFor="heroSecondaryCtaLabel">Secondary button text</Label>
          <Input id="heroSecondaryCtaLabel" name="heroSecondaryCtaLabel" defaultValue={settings.heroSecondaryCtaLabel ?? ""} />
        </div>
        <div>
          <Label htmlFor="heroSecondaryCtaHref">Secondary button link</Label>
          <Input id="heroSecondaryCtaHref" name="heroSecondaryCtaHref" defaultValue={settings.heroSecondaryCtaHref ?? ""} />
        </div>
      </div>
      <p className="text-sm font-medium">Homepage sections</p>
      <div className="flex flex-col gap-2">
        <CheckboxField name="showFeaturedProducts" label="Featured products" defaultChecked={settings.showFeaturedProducts} />
        <CheckboxField name="showCategories" label="Categories" defaultChecked={settings.showCategories} />
        <CheckboxField name="showBestSellers" label="Best sellers" defaultChecked={settings.showBestSellers} />
        <CheckboxField name="showNewsletter" label="Newsletter signup" defaultChecked={settings.showNewsletter} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save homepage"}
      </Button>
    </form>
  );
}

export function BrandingForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateBranding({}, fd);
          if (result.error) toast.error(result.error);
          else {
            toast.success("Branding saved");
            router.refresh();
          }
        });
      }}
    >
      <MediaUploadField label="Logo image" name="logoUrl" value={settings.logoUrl} folder="branding" hint="Leave empty to use text logo below." />
      <div>
        <Label htmlFor="logoText">Logo text (fallback)</Label>
        <Input id="logoText" name="logoText" maxLength={8} defaultValue={settings.logoText} required />
      </div>
      <MediaUploadField label="Favicon" name="faviconUrl" value={settings.faviconUrl} folder="branding" />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save branding"}
      </Button>
    </form>
  );
}

export function ThemeForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const colors = [
    { name: "primaryColor", label: "Primary color" },
    { name: "secondaryColor", label: "Secondary color" },
    { name: "accentColor", label: "Accent color" },
    { name: "backgroundColor", label: "Background color" },
    { name: "textColor", label: "Text color" },
    { name: "buttonColor", label: "Button color" },
  ] as const;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateTheme({}, fd);
          if (result.error) toast.error(result.error);
          else {
            toast.success("Theme saved");
            router.refresh();
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {colors.map(({ name, label }) => (
          <div key={name}>
            <Label htmlFor={name}>{label}</Label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                id={`${name}-picker`}
                defaultValue={settings[name]}
                className="h-10 w-14 cursor-pointer rounded border border-border"
                onChange={(e) => {
                  const input = document.getElementById(name) as HTMLInputElement;
                  if (input) input.value = e.target.value;
                }}
              />
              <Input id={name} name={name} defaultValue={settings[name]} required />
            </div>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save theme"}
      </Button>
    </form>
  );
}
