import { RootNode } from "../../compiler-core/src/ast.js";
import { baseCompile } from "../../compiler-core/src/compile.js";
import {
  CodegenResult,
  CompilerOptions,
} from "../../compiler-core/src/options.js";
import { DirectiveTransform } from "../../compiler-core/src/transform.js";
import { extend } from "../../shared/src/general.js";
import { parserOptions } from "./parserOptions.js";
import { transformModel } from "./transforms/vModel.js";

export { parserOptions };

export const DOMDirectiveTransforms: Record<string, DirectiveTransform> = {
  model: transformModel,
};

export function compile(
  src: string | RootNode, // template
  options: CompilerOptions = {}
): CodegenResult {
  return baseCompile(
    src,
    extend({}, parserOptions, options, {
      nodeTransforms: [],
      directiveTransforms: extend(
        {},
        DOMDirectiveTransforms,
        options.directiveTransforms || {}
      ),
      transformHoist: null,
    })
  );
}
