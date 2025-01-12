import { SourceLocation } from "./ast.js";
export interface CompilerError extends SyntaxError {
    code: number | string;
    loc?: SourceLocation;
}
export declare function defaultOnError(error: CompilerError): never;
export declare function defaultOnWarn(msg: CompilerError): void;
