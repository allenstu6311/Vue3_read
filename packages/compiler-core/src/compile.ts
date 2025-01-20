import { isString, extend } from "./../../shared/src/general.js";
import { RootNode } from "./ast.js";
import { CodegenResult, CompilerOptions } from "./options.js";
import { baseParse } from "./parser.js";
import { DirectiveTransform, NodeTransform } from "./transform.js";

export type TransformPreset = [
  NodeTransform[],
  Record<string, DirectiveTransform>
];

export function getBaseTransformPreset(prefixIdentifiers?: boolean) {
  return [[], {}];
}

export function baseCompile(
  source: string | RootNode, //template
  options: CompilerOptions = {}
): CodegenResult {
  const resolvedOptions = extend({}, options);
  const ast = isString(source) ? baseParse(source, resolvedOptions) : source;
  // console.log('ast',ast);

  return null as any;
}
