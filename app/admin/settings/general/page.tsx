// app/admin/settings/general/page.tsx
import { SettingsShell } from "@/components/admin/settings/settings-shell";
import { GeneralForm } from "@/components/admin/settings/general-form";
import { getSettings } from "@/lib/settings/helpers";

export const metadata = { title: "General Settings | Admin" };

export default async function GeneralSettingsPage() {
  const settings = await getSettings("general");

  return (
    <SettingsShell
      current="/admin/settings/general"
      title="General"
      description="Pengaturan umum aplikasi"
    >
      <GeneralForm initialData={settings} />
    </SettingsShell>
  );
}