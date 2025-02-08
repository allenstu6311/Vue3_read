import { Link } from "./dep.js";
import { activeEffectScope } from "./effectScope.js";

export type DebuggerEvent = {
  effect: Subscriber;
} & DebuggerEventExtraInfo;

export type DebuggerEventExtraInfo = {
  target: object;
  type: any;
  key: any;
  newValue?: any;
  oldValue?: any;
  oldTarget?: Map<any, any> | Set<any>;
};

export type EffectScheduler = (...args: any[]) => any;

export enum EffectFlags {
  /**
   * ReactiveEffect only
   */
  ACTIVE = 1 << 0,
  RUNNING = 1 << 1,
  TRACKING = 1 << 2,
  NOTIFIED = 1 << 3,
  DIRTY = 1 << 4,
  ALLOW_RECURSE = 1 << 5,
  PAUSED = 1 << 6,
}

export interface DebuggerOptions {
  onTrack?: (event: DebuggerEvent) => void;
  onTrigger?: (event: DebuggerEvent) => void;
}

/**
 * Subscriber is a type that tracks (or subscribes to) a list of deps.
 */
export interface Subscriber extends DebuggerOptions {
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
  flags: EffectFlags;
  /**
   * @internal
   */
  next?: Subscriber;
  /**
   * returning `true` indicates it's a computed that needs to call notify
   * on its dep too
   * @internal
   */
  notify(): true | void;
}

export interface ReactiveEffectOptions extends DebuggerOptions {
  scheduler?: EffectScheduler;
  allowRecurse?: boolean;
  onStop?: () => void;
}

const pausedQueueEffects = new WeakSet<ReactiveEffect>();

export class ReactiveEffect<T = any>
  implements Subscriber, ReactiveEffectOptions
{
  /**
   * @internal
   */
  deps?: Link = undefined;
  /**
   * @internal
   */
  depsTail?: Link = undefined;
  /**
   * @internal
   */
  flags: EffectFlags = EffectFlags.ACTIVE | EffectFlags.TRACKING;
  /**
   * @internal
   */
  next?: Subscriber = undefined;
  /**
   * @internal
   */
  cleanup?: () => void = undefined;

  scheduler?: EffectScheduler = undefined;
  onStop?: () => void;
  onTrack?: (event: DebuggerEvent) => void;
  onTrigger?: (event: DebuggerEvent) => void;

  constructor(public fn: () => T) {
    if (activeEffectScope && activeEffectScope.active) {
      activeEffectScope.effects.push(this);
    }
  }

  pause(): void {}

  resume(): void {}

  /**
   * @internal
   */
  notify(): void {}

  run() {
    return this.fn();
  }

  stop(): void {}

  trigger(): void {}

  /**
   * @internal
   */
  runIfDirty(): void {}

  // get dirty(): boolean {}
}

/**
 * @internal
 */
export let shouldTrack = true;
const trackStack: boolean[] = [];

/**
 * 暫時停止追蹤(暫停響應式)
 */
export function pauseTracking(): void {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}

/**
 * 重置之前的全域效果追蹤狀態。
 */
export function resetTracking(): void {
  const last = trackStack.pop();
  shouldTrack = last === undefined ? true : last;
}

let batchDepth = 0;
let batchedSub: Subscriber | undefined;
let batchedComputed: Subscriber | undefined;

export function batch(sub: Subscriber, isComputed = false): void {
  sub.flags |= EffectFlags.NOTIFIED;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
