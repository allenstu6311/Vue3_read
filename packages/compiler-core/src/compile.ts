import { isString, extend } from "./../../shared/src/general.js";
import { RootNode } from "./ast.js";
import { CodegenResult, CompilerOptions } from "./options.js";
import { baseParse } from "./parser.js";

export function baseCompile(
  source: string | RootNode, //template
  options: CompilerOptions = {}
): CodegenResult {
  const resolvedOptions = extend({}, options);
  const ast = isString(source) ? baseParse(source, resolvedOptions) : source;

  return null as any;
}
