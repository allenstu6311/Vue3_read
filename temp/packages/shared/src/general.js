export const extend = Object.assign;
export const NOOP = () => { };
export const isFunction = (val) => typeof val === "function";
export const isObject = (val) => val !== null && typeof val === "object";
/**
 * Always return false.
 */
export const NO = () => false;
export const isString = (val) => typeof val === "string";
export const EMPTY_OBJ = {};
export const objectToString = Object.prototype.toString;
export const toTypeString = (value) => objectToString.call(value);
/**
 * 回傳物件名稱來判斷目標類型
 * Map && Object && Set...
 */
export const toRawType = (value) => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1);
};
export function genCacheKey(source, options) {
    return (source +
        JSON.stringify(options, (_, val) => typeof val === "function" ? val.toString() : val));
}
