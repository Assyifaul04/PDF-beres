// lib/settings/defaults.ts
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowSignup: boolean;
  maxUploadMB: number;
}

export interface StorageSettings {
  supabaseEnabled: boolean;
  driveEnabled: boolean;
  driveFolderId: string;
  driveAutoMigrate: boolean;
  driveMigrateAfterHours: number;
  supabaseBucket: string;
}

export interface RetentionSettings {
  freeRetentionDays: number;
  premiumRetentionDays: number;
  anonymousRetentionHours: number;
  autoCleanupEnabled: boolean;
  cleanupCronExpression: string;
}

export interface PlanSettings {
  freeMaxFileMB: number;
  freeMaxTasksPerDay: number;
  freeMaxStorageMB: number;
  premiumMaxFileMB: number;
  premiumMaxTasksPerDay: number;
  premiumMaxStorageMB: number;
  premiumPriceIDR: number;
}

export const DEFAULT_SETTINGS = {
  general: {
    siteName: "Beres",
    siteDescription: "Platform konversi dokumen online",
    supportEmail: "support@beres.id",
    maintenanceMode: false,
    allowSignup: true,
    maxUploadMB: 50,
  } satisfies GeneralSettings,

  storage: {
    supabaseEnabled: true,
    driveEnabled: true,
    driveFolderId: "",
    driveAutoMigrate: true,
    driveMigrateAfterHours: 24,
    supabaseBucket: "beres-files",
  } satisfies StorageSettings,

  retention: {
    freeRetentionDays: 1,
    premiumRetentionDays: 30,
    anonymousRetentionHours: 6,
    autoCleanupEnabled: true,
    cleanupCronExpression: "0 3 * * *",
  } satisfies RetentionSettings,

  plans: {
    freeMaxFileMB: 10,
    freeMaxTasksPerDay: 5,
    freeMaxStorageMB: 100,
    premiumMaxFileMB: 100,
    premiumMaxTasksPerDay: 100,
    premiumMaxStorageMB: 5000,
    premiumPriceIDR: 49000,
  } satisfies PlanSettings,
};

export type SettingsKey = keyof typeof DEFAULT_SETTINGS;