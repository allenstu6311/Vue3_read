import { Dep } from "./dep.js";
import { IfAny } from "../../runtime-dom/src/typeUtils.js";
import { hasChanged } from "../../shared/src/general.js";
import { ComputedRef } from "./computed.js";
import { ReactiveFlags } from "./constants.js";
import { isReactive, toRaw, toReactive } from "./reactive.js";

declare const RefSymbol: unique symbol;
export declare const RawSymbol: unique symbol;

export interface Ref<T = any, S = T> {
  get value(): T;
  set value(_: S | any);
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true;
}

export type ShallowUnwrapRef<T> = {
  [K in keyof T]: DistributeRef<T[K]>;
};
type DistributeRef<T> = T extends Ref<infer V, unknown> ? V : T;

/**
 * Checks if a value is a ref object.
 *
 * @param r - The value to inspect.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#isref}
 */
export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>;
export function isRef(r: any): r is Ref {
  return r ? r[ReactiveFlags.IS_REF] === true : false;
}

export type MaybeRef<T = any> = {};

/**
 * Takes an inner value and returns a reactive and mutable ref object, which
 * has a single property `.value` that points to the inner value.
 *
 * @param value - The object to wrap in the ref.
 * @see {@link https://vuejs.org/api/reactivity-core.html#ref}
 */
export function ref<T>(
  value: T
): [T] extends [Ref]
  ? IfAny<T, Ref<T>, T>
  : Ref<UnwrapRef<T>, UnwrapRef<T> | T>;
export function ref<T = any>(): Ref<T | undefined>;
export function ref(value?: unknown) {
  return createRef(value, false);
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}

export type UnwrapRef<T> = {};

class RefImpl<T = any> {
  _value: T;
  private _rawValue: T;

  dep: Dep = new Dep();

  public readonly [ReactiveFlags.IS_REF] = true; // 通過isRef得判斷能夠直接取值，不須.value
  // public readonly [ReactiveFlags.IS_SHALLOW]: boolean = false;

  constructor(value: T, isShallow: boolean) {
    this._rawValue = isShallow ? value : toRaw(value);
    this._value = isShallow ? value : toReactive(value);

    // this[ReactiveFlags.IS_SHALLOW] = isShallow;
  }

  get value() {
    this.dep.track();
    return this._value;
  }

  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = false;
    newValue = useDirectValue ? newValue : toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this._rawValue = newValue;
      this._value = useDirectValue ? newValue : toReactive(newValue);
      this.dep.trigger();
    }
  }
}
/**
 * 檢查傳入的值是否為 ref，，如果是則返回其內部的值（即 ref.value）
 */
export function unref<T>(ref: MaybeRef<T> | ComputedRef<T>): T {
  return isRef(ref) ? (ref.value as T) : (ref as T);
}

const shallowUnwrapHandlers: ProxyHandler<any> = {
  get: (target, key, receiver) => {
    return key === ReactiveFlags.RAW
      ? target
      : unref(Reflect.get(target, key, receiver));
  },

  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  },
};

/**
 * 訪問資料可直接觸發get不須.value
 */
export function proxyRefs<T extends object>(
  objectWithRefs: T
): ShallowUnwrapRef<T> {
  return isReactive(objectWithRefs)
    ? (objectWithRefs as any)
    : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
