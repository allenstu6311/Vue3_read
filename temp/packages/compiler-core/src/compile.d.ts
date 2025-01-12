import { RootNode } from "./ast.js";
import { CodegenResult, CompilerOptions } from "./options.js";
export declare function baseCompile(source: string | RootNode, //template
options?: CompilerOptions): CodegenResult;
