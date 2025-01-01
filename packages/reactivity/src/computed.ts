export type ComputedGetter<T> = (oldValue?: T) => T
export type ComputedSetter<T> = (newValue: T) => void

export interface WritableComputedOptions<T, S = T> {
    get: ComputedGetter<T>
    set: ComputedSetter<S>
}