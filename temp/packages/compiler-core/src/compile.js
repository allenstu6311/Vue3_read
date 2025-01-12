import { isString, extend } from "./../../shared/src/general.js";
import { baseParse } from "./parser.js";
export function baseCompile(source, //template
options = {}) {
    const resolvedOptions = extend({}, options);
    const ast = isString(source) ? baseParse(source, resolvedOptions) : source;
    return null;
}
