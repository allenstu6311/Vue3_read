import { SourceLocation } from "./ast.js";

export interface CompilerError extends SyntaxError {
  code: number | string;
  loc?: SourceLocation;
}

export function defaultOnError(error: CompilerError): never {
  throw error;
}

export function defaultOnWarn(msg: CompilerError): void {
  false && console.warn(`[Vue warn] ${msg.message}`);
}
