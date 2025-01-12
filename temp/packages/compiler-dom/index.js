import { baseCompile } from "../compiler-core/src/compile.js";
import { extend } from "../shared/src/general.js";
import { parserOptions } from "./parserOptions.js";
export { parserOptions };
export function compile(src, // template
options = {}) {
    return baseCompile(src, extend({}, parserOptions, options, {}));
}
