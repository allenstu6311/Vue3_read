import { Dep, Link } from "./dep.js";
import { EffectFlags, Subscriber } from "./effect.js";
import { Ref } from "./ref.js";

export type ComputedGetter<T> = (oldValue?: T) => T;
export type ComputedSetter<T> = (newValue: T) => void;

export interface WritableComputedOptions<T, S = T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<S>;
}

interface BaseComputedRef<T, S = T> extends Ref<T, S> {}
export interface ComputedRef<T = any> extends BaseComputedRef<T> {
  readonly value: T;
}

export class ComputedRefImpl<T = any> implements Subscriber {
  /**
   * Head of the doubly linked list representing the deps
   * @internal
   */
  deps?: Link;
  /**
   * Tail of the same list
   * @internal
   */
  depsTail?: Link;
  /**
   * @internal
   */
  flags: EffectFlags = EffectFlags.DIRTY;
  /**
   * @internal
   */
  next?: Subscriber;
  /**
   * returning `true` indicates it's a computed that needs to call notify
   * on its dep too
   * @internal
   */
  notify(): true | void {}
  /**
   * @internal
   */
  readonly dep: Dep = new Dep(this);
}
