// components/upload/landing-hero.tsx
"use client";

import { useRouter } from "next/navigation";
import { FileDropzone } from "@/components/upload/file-dropzone";

export function LandingHero() {
  const router = useRouter();

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    // TODO: upload ke /api/upload lalu redirect dengan fileId
    console.log("Files selected:", files);

    // Sementara redirect ke halaman merge-pdf
    router.push("/merge-pdf");
  };

  return (
    <FileDropzone
      title="Setiap alat PDF dalam satu tempat"
      description="Gabungkan, pisahkan, kompres, konversi, dan edit PDF secara online — gratis, cepat, dan aman. Tidak perlu instalasi."
      accept="application/pdf"
      maxSize={1024 * 1024 * 1024}
      onFilesSelected={handleFilesSelected}
    />
  );
}