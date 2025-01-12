import { RootNode } from "../compiler-core/src/ast.js";
import { CodegenResult, CompilerOptions } from "../compiler-core/src/options.js";
import { parserOptions } from "./parserOptions.js";
export { parserOptions };
export declare function compile(src: string | RootNode, // template
options?: CompilerOptions): CodegenResult;
