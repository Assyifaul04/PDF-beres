// lib/processors/errors.ts
export class PDFProcessingError extends Error {
  code: string;
  context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PDFProcessingError';
    this.code = code;
    this.context = context;
  }
}

export function assert(
  condition: unknown,
  message: string,
  code?: string
): asserts condition {
  if (!condition) {
    throw new PDFProcessingError(message, code ?? 'ASSERTION_FAILED');
  }
}