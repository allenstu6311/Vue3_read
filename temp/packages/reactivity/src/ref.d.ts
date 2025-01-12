import { IfAny } from "../../runtime-dom/src/typeUtils.js";
import { ComputedRef } from "./computed.js";
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
export declare function isRef<T>(r: Ref<T> | unknown): r is Ref<T>;
export type MaybeRef<T = any> = {};
/**
 * Takes an inner value and returns a reactive and mutable ref object, which
 * has a single property `.value` that points to the inner value.
 *
 * @param value - The object to wrap in the ref.
 * @see {@link https://vuejs.org/api/reactivity-core.html#ref}
 */
export declare function ref<T>(value: T): [T] extends [Ref] ? IfAny<T, Ref<T>, T> : Ref<UnwrapRef<T>, UnwrapRef<T> | T>;
export declare function ref<T = any>(): Ref<T | undefined>;
export type UnwrapRef<T> = {};
/**
 * 檢查傳入的值是否為 ref，，如果是則返回其內部的值（即 ref.value）
 */
export declare function unref<T>(ref: MaybeRef<T> | ComputedRef<T>): T;
export declare function proxyRefs<T extends object>(objectWithRefs: T): ShallowUnwrapRef<T>;
export {};
