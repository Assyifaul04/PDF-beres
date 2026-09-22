// app/admin/settings/plans/page.tsx
import { SettingsShell } from "@/components/admin/settings/settings-shell";
import { PlansForm } from "@/components/admin/settings/plans-form";
import { getSettings } from "@/lib/settings/helpers";

export const metadata = { title: "Plans & Pricing | Admin" };

export default async function PlansSettingsPage() {
  const settings = await getSettings("plans");

  return (
    <SettingsShell
      current="/admin/settings/plans"
      title="Plans & Pricing"
      description="Limit FREE vs PREMIUM"
    >
      <PlansForm initialData={settings} />
    </SettingsShell>
  );
}