// stubs/empty-module.ts
/**
 * Stub modul untuk menggantikan modul Node.js `module` yang tidak tersedia
 * di browser. Digunakan oleh `next.config.ts` via `turbopack.resolveAlias`.
 *
 * Ghostscript WASM menggunakan `createRequire` dari modul `module`.
 * Kita sediakan stub kosong agar tidak error saat bundling.
 */

// Stub untuk `createRequire`
export function createRequire(_filename: string) {
  return function require(_id: string): unknown {
    throw new Error(
      `require() tidak tersedia di browser. Module: ${_id}`
    );
  };
}

const emptyModule = {};
export default emptyModule;