import { RootNode } from "../compiler-core/src/ast.js";
import { baseCompile } from "../compiler-core/src/compile.js";
import {
  CodegenResult,
  CompilerOptions,
} from "../compiler-core/src/options.js";
import { extend } from "../shared/src/general.js";
import { parserOptions } from "./parserOptions.js";

export { parserOptions };

export function compile(
  src: string | RootNode, // template
  options: CompilerOptions = {}
): CodegenResult {
  return baseCompile(src, extend({}, parserOptions, options, {}));
}
