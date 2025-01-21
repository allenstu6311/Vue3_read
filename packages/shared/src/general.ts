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
  Object.prototype.toString;

export const toTypeString = (value: unknown): string =>
  objectToString.call(value);

const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null);
  return ((str: string) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  }) as T;
};

/**
 * 回傳物件名稱來判斷目標類型
 * Map && Object && Set...
 */
export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1);
};

export function genCacheKey(source: string, options: any): string {
  return (
    source +
    JSON.stringify(options, (_, val) =>
      typeof val === "function" ? val.toString() : val
    )
  );
}

/**
 * 快取字串處理
 * @private
 */
export const capitalize: <T extends string>(str: T) => Capitalize<T> =
  cacheStringFunction(<T extends string>(str: T) => {
    return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
  });

const camelizeRE = /-(\w)/g;
/**
 * @private
 */
export const camelize: (str: string) => string = cacheStringFunction(
  (str: string): string => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""));
  }
);

export const isArray: typeof Array.isArray = Array.isArray;
