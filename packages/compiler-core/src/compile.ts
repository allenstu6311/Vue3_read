import { isString, extend } from "./../../shared/src/general.js";
import { RootNode } from "./ast.js";
import { CodegenResult, CompilerOptions } from "./options.js";
import { baseParse } from "./parser.js";
import { DirectiveTransform, NodeTransform, transform } from "./transform.js";
import { transformElement } from "./transforms/transformElement.js";

/* v8 ignore stop */
const prefixIdentifiers = false;

export type TransformPreset = [
  NodeTransform[],
  Record<string, DirectiveTransform>
];

export function getBaseTransformPreset(
  prefixIdentifiers?: boolean
): TransformPreset {
  return [[transformElement], {}];
}

export function baseCompile(
  source: string | RootNode, //template
  options: CompilerOptions = {}
): CodegenResult {
  const resolvedOptions = extend({}, options);
  const ast = isString(source) ? baseParse(source, resolvedOptions) : source;
  // console.log('ast',ast);
  const [nodeTransforms, directiveTransforms] =
    getBaseTransformPreset(prefixIdentifiers);

  transform(
    ast,
    extend({}, resolvedOptions, {
      nodeTransforms: [
        ...nodeTransforms,
        ...(options.nodeTransforms || []), // user transforms
      ],
      directiveTransforms: extend(
        {},
        directiveTransforms,
        options.directiveTransforms || {} // user transforms
      ),
    })
  );

  return null as any;
}
