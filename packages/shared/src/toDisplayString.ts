import { isString } from "./general.js";

export const toDisplayString = (val: unknown): string => {
  return isString(val) ? val : "";
};
