import { TrackOpTypes } from "./constants.js";
import { ARRAY_ITERATE_KEY, track } from "./dep.js";
import { toRaw } from "./reactive.js";

/**
 * Track array iteration and return raw array
 */
export function shallowReadArray<T>(arr: T[]): T[] {
  track((arr = toRaw(arr)), TrackOpTypes.ITERATE, ARRAY_ITERATE_KEY);
  return arr;
}
