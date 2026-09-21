import { prisma } from "@/lib/prisma";
import { ToolTypeMapping } from "@/components/admin/tool-menus/tool-type-mapping";

export const metadata = {
  title: "Tool Type Mapping | Admin",
};

export default async function ToolTypePage() {
  const menus = await prisma.toolMenu.findMany({
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      toolType: true,
      isActive: true,
      category: { select: { id: true, name: true } },
    },
  });

  // Ambil enum ToolType dari Prisma
  const toolTypes = [
    "MERGE_PDF",
    "SPLIT_PDF",
    "COMPRESS_PDF",
    "PDF_TO_WORD",
    "PDF_TO_POWERPOINT",
    "PDF_TO_EXCEL",
    "WORD_TO_PDF",
    "POWERPOINT_TO_PDF",
    "EXCEL_TO_PDF",
    "EDIT_PDF",
    "PDF_TO_JPG",
    "JPG_TO_PDF",
    "SIGN_PDF",
    "WATERMARK_PDF",
    "ROTATE_PDF",
    "HTML_TO_PDF",
    "UNLOCK_PDF",
    "PROTECT_PDF",
    "ORGANIZE_PDF",
    "REPAIR_PDF",
    "PAGE_NUMBERS",
  ] as const;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Tool Type Mapping
        </h1>
        <p className="text-muted-foreground">
          Hubungkan ToolMenu ke enum ToolType. Menu tanpa mapping tidak akan
          muncul di halaman konversi.
        </p>
      </div>

      <ToolTypeMapping menus={menus} toolTypes={toolTypes} />
    </div>
  );
}