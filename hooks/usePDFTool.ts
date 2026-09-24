// hooks/usePDFTool.ts
import { useState, useCallback } from 'react';
import { runPDFTool } from '@/lib/processors';
import { PDFTool, FileInput, ProcessOptions } from '@/lib/processors/types';

export function usePDFTool() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (
    tool: PDFTool,
    files: File[],
    options: ProcessOptions = {}
  ) => {
    setLoading(true); setError(null); setProgress(0);
    try {
      const inputs: FileInput[] = await Promise.all(files.map(async f => ({
        buffer: await f.arrayBuffer(),
        name: f.name,
        type: f.type,
        size: f.size,
      })));

      const result = await runPDFTool(tool, inputs, {
        ...options,
        onProgress: (p) => setProgress(p),
      });

      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, progress, error };
}