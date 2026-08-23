/**
 * Raised for every Inspector-specific failure (no Runable project found,
 * config failed to load, ...) so callers can distinguish "the project the
 * Inspector was pointed at is invalid" from an arbitrary thrown value.
 */
export class RunableInspectorError extends Error {
  override readonly name = "RunableInspectorError";

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}
