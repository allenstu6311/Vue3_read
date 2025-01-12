export declare const extend: typeof Object.assign;
export declare const NOOP: () => void;
export declare const isFunction: (val: unknown) => val is Function;
export declare const isObject: (val: unknown) => val is Record<any, any>;
/**
 * Always return false.
 */
export declare const NO: () => boolean;
export declare const isString: (val: unknown) => val is string;
export declare const EMPTY_OBJ: {
    readonly [key: string]: any;
};
export declare const objectToString: typeof Object.prototype.toString;
export declare const toTypeString: (value: unknown) => string;
/**
 * 回傳物件名稱來判斷目標類型
 * Map && Object && Set...
 */
export declare const toRawType: (value: unknown) => string;
export declare function genCacheKey(source: string, options: any): string;
