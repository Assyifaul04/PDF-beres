// scripts/copy-wasm.mjs
import { mkdirSync, copyFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const srcDir = "node_modules/@okathira/ghostpdl-wasm/dist";
const destDir = "public/wasm";

// Skip jika package belum ter-install (misal saat CI awal)
if (!existsSync(srcDir)) {
  console.log("⚠️  @okathira/ghostpdl-wasm belum ter-install, skip copy.");
  process.exit(0);
}

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

const files = readdirSync(srcDir).filter((f) => f.endsWith(".wasm"));

if (files.length === 0) {
  console.log("⚠️  Tidak ada file .wasm di package, skip copy.");
  process.exit(0);
}

for (const file of files) {
  copyFileSync(join(srcDir, file), join(destDir, file));
  console.log(`✅ Copied ${file} → ${destDir}/`);
}

console.log(`✅ Selesai: ${files.length} file .wasm disalin.`);