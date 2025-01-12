import { ReactiveFlags } from "./constants.js";
export interface Target {
    [ReactiveFlags.SKIP]?: boolean;
    [ReactiveFlags.IS_REACTIVE]?: boolean;
    [ReactiveFlags.IS_READONLY]?: boolean;
    [ReactiveFlags.IS_SHALLOW]?: boolean;
    [ReactiveFlags.RAW]?: any;
}
export type UnwrapNestedRefs<T> = {};
declare const ReactiveMarkerSymbol: unique symbol;
export interface ReactiveMarker {
    [ReactiveMarkerSymbol]?: void;
}
export type Reactive<T> = UnwrapNestedRefs<T> & (T extends readonly any[] ? ReactiveMarker : {});
export declare const reactiveMap: WeakMap<Target, any>;
/**
 * 返回原始對象
 */
export declare function toRaw<T>(observed: T): T;
export declare function reactive<T extends object>(target: T): Reactive<T>;
/**
 * Returns a reactive proxy of the given value (if possible).
 *
 * If the given value is not an object, the original value itself is returned.
 *
 * @param value - The value for which a reactive proxy shall be created.
 */
export declare const toReactive: <T extends unknown>(value: T) => T;
/**
 * 判断一个对象是否是通过 reactive 或 shallowReactive 创建的响应式对
 *
 * isReactive(reactive({}))            // => true
 * isReactive(readonly(reactive({})))  // => true
 * isReactive(ref({}).value)           // => true
 * isReactive(readonly(ref({})).value) // => true
 * isReactive(ref(true))               // => false
 * isReactive(shallowRef({}).value)    // => false
 * isReactive(shallowReactive({}))     // => true
 */
export declare function isReactive(value: unknown): boolean;
export declare function isReadonly(value: unknown): boolean;
export {};
