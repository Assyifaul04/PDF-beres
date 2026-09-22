// lib/settings/helpers.ts
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, SettingsKey } from "./defaults";

/**
 * Ambil setting group, fallback ke default kalau belum ada di DB.
 */
export async function getSettings<K extends SettingsKey>(
  key: K
): Promise<(typeof DEFAULT_SETTINGS)[K]> {
  const row = await prisma.systemSetting.findUnique({
    where: { key },
  });

  if (!row) return DEFAULT_SETTINGS[key];

  // Merge dengan default supaya field baru otomatis terisi
  return {
    ...DEFAULT_SETTINGS[key],
    ...(row.value as object),
  };
}

/**
 * Simpan setting group (upsert).
 */
export async function setSettings<K extends SettingsKey>(
  key: K,
  value: (typeof DEFAULT_SETTINGS)[K],
  updatedBy?: string
) {
  return prisma.systemSetting.upsert({
    where: { key },
    create: { key, value: value as any, updatedBy },
    update: { value: value as any, updatedBy },
  });
}

/**
 * Ambil semua settings sekaligus (untuk admin panel).
 */
export async function getAllSettings() {
  const rows = await prisma.systemSetting.findMany();

  const map = new Map(rows.map((r) => [r.key, r.value]));

  return {
    general: { ...DEFAULT_SETTINGS.general, ...(map.get("general") as object ?? {}) },
    storage: { ...DEFAULT_SETTINGS.storage, ...(map.get("storage") as object ?? {}) },
    retention: { ...DEFAULT_SETTINGS.retention, ...(map.get("retention") as object ?? {}) },
    plans: { ...DEFAULT_SETTINGS.plans, ...(map.get("plans") as object ?? {}) },
  };
}