import { IfAny } from "../../runtime-dom/src/typeUtils.js";
import { ReactiveFlags } from "./constants.js";

declare const RefSymbol: unique symbol;
export declare const RawSymbol: unique symbol;

export interface Ref<T = any, S = T> {
  get value(): T;
  set value(_: S);
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true;
}

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
  return null as any;
}

export type UnwrapRef<T> = {};
