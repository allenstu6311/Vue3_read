import { Ref } from "./ref";
export type ComputedGetter<T> = (oldValue?: T) => T;
export type ComputedSetter<T> = (newValue: T) => void;
export interface WritableComputedOptions<T, S = T> {
    get: ComputedGetter<T>;
    set: ComputedSetter<S>;
}
interface BaseComputedRef<T, S = T> extends Ref<T, S> {
}
export interface ComputedRef<T = any> extends BaseComputedRef<T> {
    readonly value: T;
}
export {};
