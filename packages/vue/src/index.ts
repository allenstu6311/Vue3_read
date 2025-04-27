import { CompilerOptions } from "./../../compiler-core/src/options.js";
import { compile } from "../../compiler-dom/src/index.js";
import { registerRuntimeCompiler } from "../../runtime-core/src/component.js";
import { RenderFunction } from "../../runtime-core/src/componentOptions.js";
import {
  extend,
  genCacheKey,
  isString,
  NOOP,
} from "../../shared/src/general.js";
import * as runtimeDom from "../../runtime-dom/src/index.js";

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

  const { code } = compile(template, opts);
  const render = new Function("Vue", code)(runtimeDom);

  return (compileCache[key] = render);
}
registerRuntimeCompiler(compileToFunction);

export { compileToFunction as compile };
export * from "../../runtime-dom/src/index.js";
