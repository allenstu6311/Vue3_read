import { CompilerOptions } from "./../../compiler-core/src/options.js";
import { compile } from "../../compiler-dom/index.js";
import { registerRuntimeCompiler } from "../../runtime-core/src/component.js";
import { RenderFunction } from "../../runtime-core/src/componentOptions.js";
import {
  extend,
  genCacheKey,
  isString,
  NOOP,
} from "../../shared/src/general.js";

const compileCache: Record<string, RenderFunction> = Object.create(null);

function compileToFunction(
  template: string | HTMLElement,
  options?: CompilerOptions
): RenderFunction {
  if (!isString(template)) {
    if (template.nodeType) {
      template = template.innerHTML;
    } else {
      return NOOP;
    }
  }
  const key = genCacheKey(template, options);

  const opts = extend(
    {
      hoistStatic: true,
    } as CompilerOptions,
    options
  );

  // const { code } = compile(template);
  compile(template, opts);
  return null as any;
}
registerRuntimeCompiler(compileToFunction);

export * from "../../runtime-dom/src/index.js";
