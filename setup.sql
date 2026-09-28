-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('SUPABASE', 'GOOGLE_DRIVE');

-- CreateEnum
CREATE TYPE "MigrationStatus" AS ENUM ('TEMP', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ToolType" AS ENUM ('MERGE_PDF', 'SPLIT_PDF', 'COMPRESS_PDF', 'PDF_TO_WORD', 'PDF_TO_POWERPOINT', 'PDF_TO_EXCEL', 'WORD_TO_PDF', 'POWERPOINT_TO_PDF', 'EXCEL_TO_PDF', 'EDIT_PDF', 'PDF_TO_JPG', 'JPG_TO_PDF', 'SIGN_PDF', 'WATERMARK_PDF', 'ROTATE_PDF', 'HTML_TO_PDF', 'UNLOCK_PDF', 'PROTECT_PDF', 'ORGANIZE_PDF', 'REPAIR_PDF', 'PAGE_NUMBERS');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "usedBytes" BIGINT NOT NULL DEFAULT 0,
    "taskCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "originalName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'SUPABASE',
    "migrationStatus" "MigrationStatus" NOT NULL DEFAULT 'TEMP',
    "driveFileId" TEXT,
    "moveToDriveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "toolType" "ToolType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "document_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_input_files" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "task_input_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_output_files" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "task_output_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_menus" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "href" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "toolType" "ToolType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "files_fileKey_key" ON "files"("fileKey");

-- CreateIndex
CREATE INDEX "files_userId_idx" ON "files"("userId");

-- CreateIndex
CREATE INDEX "files_migrationStatus_moveToDriveAt_idx" ON "files"("migrationStatus", "moveToDriveAt");

-- CreateIndex
CREATE INDEX "files_expiresAt_idx" ON "files"("expiresAt");

-- CreateIndex
CREATE INDEX "document_tasks_userId_idx" ON "document_tasks"("userId");

-- CreateIndex
CREATE INDEX "document_tasks_status_createdAt_idx" ON "document_tasks"("status", "createdAt");

-- CreateIndex
CREATE INDEX "document_tasks_toolType_createdAt_idx" ON "document_tasks"("toolType", "createdAt");

-- CreateIndex
CREATE INDEX "task_input_files_taskId_idx" ON "task_input_files"("taskId");

-- CreateIndex
CREATE INDEX "task_input_files_fileId_idx" ON "task_input_files"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "task_input_files_taskId_fileId_key" ON "task_input_files"("taskId", "fileId");

-- CreateIndex
CREATE INDEX "task_output_files_taskId_idx" ON "task_output_files"("taskId");

-- CreateIndex
CREATE INDEX "task_output_files_fileId_idx" ON "task_output_files"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "task_output_files_taskId_fileId_key" ON "task_output_files"("taskId", "fileId");

-- CreateIndex
CREATE INDEX "system_logs_level_createdAt_idx" ON "system_logs"("level", "createdAt");

-- CreateIndex
CREATE INDEX "system_logs_action_createdAt_idx" ON "system_logs"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tool_categories_name_key" ON "tool_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tool_categories_slug_key" ON "tool_categories"("slug");

-- CreateIndex
CREATE INDEX "tool_categories_order_idx" ON "tool_categories"("order");

-- CreateIndex
CREATE INDEX "tool_categories_isActive_idx" ON "tool_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "tool_menus_slug_key" ON "tool_menus"("slug");

-- CreateIndex
CREATE INDEX "tool_menus_categoryId_order_idx" ON "tool_menus"("categoryId", "order");

-- CreateIndex
CREATE INDEX "tool_menus_isActive_idx" ON "tool_menus"("isActive");

-- CreateIndex
CREATE INDEX "tool_menus_toolType_idx" ON "tool_menus"("toolType");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_key_idx" ON "system_settings"("key");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_tasks" ADD CONSTRAINT "document_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_input_files" ADD CONSTRAINT "task_input_files_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "document_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_input_files" ADD CONSTRAINT "task_input_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_output_files" ADD CONSTRAINT "task_output_files_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "document_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_output_files" ADD CONSTRAINT "task_output_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_menus" ADD CONSTRAINT "tool_menus_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tool_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

