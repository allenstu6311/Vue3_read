export const extend: typeof Object.assign = Object.assign;
export const NOOP = (): void => {}
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function';

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object';


/**
 * Always return false.
 */
export const NO = () => false;

export const isString = (val: unknown): val is string => typeof val === 'string'