// app/admin/settings/retention/page.tsx
import { SettingsShell } from "@/components/admin/settings/settings-shell";
import { RetentionForm } from "@/components/admin/settings/retention-form";
import { getSettings } from "@/lib/settings/helpers";

export const metadata = { title: "File Retention | Admin" };

export default async function RetentionSettingsPage() {
  const settings = await getSettings("retention");

  return (
    <SettingsShell
      current="/admin/settings/retention"
      title="File Retention"
      description="Kebijakan expiresAt & cleanup otomatis"
    >
      <RetentionForm initialData={settings} />
    </SettingsShell>
  );
}