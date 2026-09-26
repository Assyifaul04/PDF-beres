// lib/processors/client/ghostscript-loader.ts
/**
 * Singleton loader untuk Ghostscript WASM.
 * Menggunakan @okathira/ghostpdl-wasm (atau fork yang kompatibel).
 */

type GhostscriptModule = {
  FS: {
    writeFile: (path: string, data: Uint8Array) => void;
    readFile: (path: string, opts?: { encoding?: "binary" | "utf8" }) => Uint8Array;
    unlink: (path: string) => void;
  };
  callMain: (args: string[]) => void;
  exitStatus?: number;
};

let modulePromise: Promise<GhostscriptModule> | null = null;

export async function getGhostscript(): Promise<GhostscriptModule> {
  if (!modulePromise) {
    modulePromise = (async () => {
      const mod = await import("@okathira/ghostpdl-wasm");
      const loadWASM = mod.default;
      const instance = await loadWASM({
        print: () => {},
        printErr: (msg: string) => {
          console.warn("[ghostscript]", msg);
        },
      });
      return instance as unknown as GhostscriptModule;
    })().catch((err) => {
      modulePromise = null;
      throw err;
    });
  }
  return modulePromise;
}