// app/api/admin/settings/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { getAllSettings, setSettings } from "@/lib/settings/helpers";
import { DEFAULT_SETTINGS, SettingsKey } from "@/lib/settings/defaults";

// GET — semua settings
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await getAllSettings();
  return ok(settings);
}

// PATCH — update 1 group
const patchSchema = z.object({
  key: z.enum(["general", "storage", "retention", "plans"]),
  value: z.record(z.string(), z.unknown()),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  // Jika ada error (misal 401/403), auth.user bernilai null
  if (auth.error || !auth.user) return auth.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Format JSON tidak valid", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Data tidak valid", 422, parsed.error.flatten());
  }

  const { key, value } = parsed.data;
  const merged = { ...DEFAULT_SETTINGS[key as SettingsKey], ...value };
  await setSettings(key as SettingsKey, merged as any, auth.user.id);

  return ok({ key, value: merged });
}