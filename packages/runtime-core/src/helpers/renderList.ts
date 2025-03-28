import { shallowReadArray } from "../../../reactivity/src/arrayInstrumentations.js";
import {
  isReactive,
  isShallow,
  toReactive,
} from "../../../reactivity/src/reactive.js";
import { isArray, isString } from "../../../shared/src/general.js";
import { VNode, VNodeChild } from "../vnode.js";

/**
 * v-for string
 * @private
 */
export function renderList(
  source: string,
  renderItem: (value: string, index: number) => VNodeChild
): VNodeChild[];

/**
 * v-for number
 */
export function renderList(
  source: number,
  renderItem: (value: number, index: number) => VNodeChild
): VNodeChild[];

/**
 * v-for array
 */
export function renderList<T>(
  source: T[],
  renderItem: (value: T, index: number) => VNodeChild
): VNodeChild[];

/**
 * v-for iterable
 */
export function renderList<T>(
  source: Iterable<T>,
  renderItem: (value: T, index: number) => VNodeChild
): VNodeChild[];

/**
 * v-for object
 */
export function renderList<T>(
  source: T,
  renderItem: <K extends keyof T>(
    value: T[K],
    key: string,
    index: number
  ) => VNodeChild
): VNodeChild[];
/**
 * Actual implementation
 */
export function renderList(
  source: any, // v-for item in data 的data
  renderItem: (...args: any[]) => VNodeChild,
  cache?: any[],
  index?: number
): VNodeChild[] {
  let ret: VNodeChild[];
  const cached = (cache && cache[index!]) as VNode[] | undefined;
  const sourceIsArray = isArray(source);

  if (sourceIsArray || isString(source)) {
    const sourceIsReactiveArray = sourceIsArray && isReactive(source);
    let needsWrap = false;

    if (sourceIsReactiveArray) {
      needsWrap = !isShallow(source);
      source = shallowReadArray(source);
    }
    ret = new Array(source.length);

    for (let i = 0; i < source.length; i++) {
      ret[i] = renderItem(
        needsWrap ? toReactive(source[i]) : source[i],
        i,
        undefined,
        cached && cached[i]
      );
    }
  } else {
    ret = [];
  }

  if (cache) {
    cache[index!] = ret;
  }

  return ret;
}
