import { isString, extend } from "./../../shared/src/general.js";
import { RootNode } from "./ast.js";
import { generate } from "./codegen.js";
import { CodegenResult, CompilerOptions } from "./options.js";
import { baseParse } from "./parser.js";
import { DirectiveTransform, NodeTransform, transform } from "./transform.js";
import { transformElement } from "./transforms/transformElement.js";
import { transformFor } from "./transforms/vFor.js";
import { transformModel } from "./transforms/vModel.js";
import { transformOn } from "./transforms/vOn.js";

/* v8 ignore stop */
const prefixIdentifiers = false;

export type TransformPreset = [
  NodeTransform[],
  Record<string, DirectiveTransform>
];

export function getBaseTransformPreset(
  prefixIdentifiers?: boolean
): TransformPreset {
  return [
    [transformElement, transformFor],
    {
      on: transformOn,
      model: transformModel,
    },
  ];
}

export function baseCompile(
  source: string | RootNode, //template
  options: CompilerOptions = {}
): CodegenResult {
  const resolvedOptions = extend({}, options);
  const ast = isString(source) ? baseParse(source, resolvedOptions) : source;

  const [nodeTransforms, directiveTransforms] =
    getBaseTransformPreset(prefixIdentifiers);
  console.log("ast", ast);
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

  return generate(ast, resolvedOptions);
  return null as any;
}
