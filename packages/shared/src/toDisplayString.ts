import { isRef } from "../../reactivity/src/ref.js";
import {
  isArray,
  isFunction,
  isObject,
  isString,
  objectToString,
} from "./general.js";

export const toDisplayString = (val: unknown): string => {
  return isString(val)
    ? val
    : val == null
    ? ""
    : isArray(val) ||
      (isObject(val) &&
        (val.toString === objectToString || !isFunction(val.toString)))
    ? isRef(val)
      ? toDisplayString(val.value)
      : JSON.stringify(val, replacer, 2)
    : String(val);
};

const replacer = (_key: string, val: unknown): any => {};
