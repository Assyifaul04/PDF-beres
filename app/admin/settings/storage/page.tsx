// app/admin/settings/storage/page.tsx
import { SettingsShell } from "@/components/admin/settings/settings-shell";
import { StorageForm } from "@/components/admin/settings/storage-form";
import { getSettings } from "@/lib/settings/helpers";

export const metadata = { title: "Storage Settings | Admin" };

export default async function StorageSettingsPage() {
  const settings = await getSettings("storage");

  return (
    <SettingsShell
      current="/admin/settings/storage"
      title="Storage"
      description="Konfigurasi Supabase Storage & Google Drive"
    >
      <StorageForm initialData={settings} />
    </SettingsShell>
  );
}