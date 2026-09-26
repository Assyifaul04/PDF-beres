// components/landing/tool-icon.tsx
import Image from "next/image";
import { File, type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

/**
 * Cek apakah string icon adalah path file gambar
 * (mis. "/image/icons/merge_pdf.png") atau URL eksternal.
 */
function isImagePath(value: string): boolean {
  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    /\.(png|jpe?g|svg|webp|gif)$/i.test(value)
  );
}

type ToolIconProps = {
  /** Nilai dari ToolMenu.icon di database. */
  name: string | null | undefined;
  /** Ukuran sisi icon dalam px (default 24). */
  size?: number;
  className?: string;
  alt?: string;
};

/**
 * Render icon dari database:
 * - Path gambar → next/image
 * - Nama Lucide → komponen Lucide
 * - Kosong/tidak ketemu → fallback File
 */
export function ToolIcon({
  name,
  size = 24,
  className,
  alt = "",
}: ToolIconProps) {
  if (!name) {
    return <File width={size} height={size} className={className} aria-hidden />;
  }

  if (isImagePath(name)) {
    return (
      <Image
        src={name}
        alt={alt}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  // Dukung "FileText" maupun "file-text"
  const pascal = name
    .split(/[-_\s]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  const Icon =
    (LucideIcons as unknown as Record<string, LucideIcon>)[name] ??
    (LucideIcons as unknown as Record<string, LucideIcon>)[pascal] ??
    File;

  return <Icon width={size} height={size} className={className} aria-hidden />;
}