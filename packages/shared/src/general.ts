export const extend: typeof Object.assign = Object.assign;
export const NOOP = (): void => {};
export const isFunction = (val: unknown): val is Function =>
  typeof val === "function";

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === "object";

/**
 * Always return false.
 */
export const NO = () => false;

export const isString = (val: unknown): val is string =>
  typeof val === "string";

export const EMPTY_OBJ: { readonly [key: string]: any } = {};

export const objectToString: typeof Object.prototype.toString =
  Object.prototype.toString

export const toTypeString = (value: unknown): string =>
  objectToString.call(value)


/**
 * 回傳物件名稱來判斷目標類型
 * Map && Object && Set...
 */
export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}
