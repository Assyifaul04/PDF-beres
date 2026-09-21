// components/layout/navbar.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NavbarClient } from "./navbar-client";
import { getActiveMenuColumns } from "@/lib/queries/tool-menus";

export async function Navbar() {
  const [session, menuColumns] = await Promise.all([
    getServerSession(authOptions),
    getActiveMenuColumns(),
  ]);

  // Kelompokkan kategori untuk tiap dropdown
  const pdfColumns = menuColumns.filter((c) =>
    ["convert-to-pdf", "convert-from-pdf"].includes(c.slug),
  );

  const allToolColumns = menuColumns; // semua kategori

  return (
    <NavbarClient
      session={session}
      pdfColumns={pdfColumns}
      allToolColumns={allToolColumns}
    />
  );
}
