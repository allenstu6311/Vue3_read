import { isRef } from "../../reactivity/src/ref.js";
import {
  isArray,
  isFunction,
  isObject,
  isString,
  objectToString,
} from "./general.js";

export const toDisplayString = (val: unknown): string => {
  if (isString(val)) {
    return val;
  }

  if (val == null) {
    return "";
  }

  const isPlainObject =
    isObject(val) &&
    (val.toString === objectToString || !isFunction(val.toString));

  if (isArray(val) || isPlainObject) {
    if (isRef(val)) {
      return toDisplayString(val.value);
    } else {
      return JSON.stringify(val, replacer, 2);
    }
  }

  return String(val);
};

const replacer = (_key: string, val: unknown): any => {};
