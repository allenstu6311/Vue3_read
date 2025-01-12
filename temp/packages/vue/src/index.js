import { compile } from "../../compiler-dom/index.js";
import { registerRuntimeCompiler } from "../../runtime-core/src/component.js";
import { genCacheKey, isString, NOOP } from "../../shared/src/general.js";
const compileCache = Object.create(null);
function compileToFunction(template, options) {
    if (!isString(template)) {
        if (template.nodeType) {
            template = template.innerHTML;
        }
        else {
            return NOOP;
        }
    }
    const key = genCacheKey(template, options);
    // const { code } = compile(template);
    compile(template);
    return null;
}
registerRuntimeCompiler(compileToFunction);
export * from "../../runtime-dom/src/index.js";
