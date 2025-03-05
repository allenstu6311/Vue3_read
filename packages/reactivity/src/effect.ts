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
   * **Effect 正在運行中**
   * - 設置時表示 `ReactiveEffect` 處於活躍狀態
   */
  ACTIVE = 1 << 0,

  /**
   * **Effect 執行中**
   * - 用於避免遞歸執行或重複調用
   */
  RUNNING = 1 << 1,

  /**
   * **Effect 正在追蹤依賴**
   * - 設置時表示該 `Effect` 會收集 `Dep`
   */
  TRACKING = 1 << 2,

  /**
   * **Effect 已被通知**
   * - 變數變更後，確保 Effect 在批次更新時不重複執行
   */
  NOTIFIED = 1 << 3,

  /**
   * **Effect 需要重新計算**
   * - `computed` 變更後，標記為 **髒狀態**，需重新運行
   */
  DIRTY = 1 << 4,

  /**
   * **允許遞歸調用**
   * - 允許 `Effect` 在執行時重新觸發自己
   */
  ALLOW_RECURSE = 1 << 5,

  /**
   * **Effect 暫停執行**
   * - 用於暫時阻止 Effect 運行
   */
  PAUSED = 1 << 6,
}

export interface DebuggerOptions {
  onTrack?: (event: DebuggerEvent) => void;
  onTrigger?: (event: DebuggerEvent) => void;
}

/**
 * `Subscriber` 代表 Vue 3 響應式系統中的「訂閱者」，負責追蹤它所依賴的 `Dep`。
 *
 * 在 Vue 3 的響應式系統中：
 * - `Dep` 代表 **響應式數據**，當數據變化時，需要通知所有訂閱該數據的 `Subscriber`。
 * - `Subscriber` 代表 **依賴這些數據的計算**（如 `Effect` 或 `Computed`）。
 *
 * `Subscriber` 本身是一個雙向鏈結串列，方便追蹤 **它依賴的 `Dep`**。
 */
export interface Subscriber extends DebuggerOptions {
  /**
   * `deps` 指向 `Subscriber` 所依賴的 `Dep` 鏈結串列的 **頭部**。
   * - `Subscriber` 可能依賴多個 `Dep`，這些 `Dep` 會透過 `Link` 連結。
   * - `deps` 指向第一個 `Dep`，用於快速存取 `Subscriber` 依賴的 `Dep`。
   * - 這是一個 **雙向鏈結串列**（doubly linked list）。
   *
   * @internal
   */
  deps?: Link;

  /**
   * `depsTail` 指向 `Subscriber` 所依賴的 `Dep` 鏈結串列的 **尾部**。
   * - `depsTail` 讓 `Subscriber` 能夠 **快速從尾部新增 `Dep`**。
   * - 這樣可以 **提升依賴關係管理的效能**。
   *
   * @internal
   */
  depsTail?: Link;

  /**
   * `flags` 用於記錄 `Subscriber` 的狀態。
   * - 這個 `flags` 屬性使用 **位運算（bitwise flags）** 來存儲不同的狀態，如：
   *   - `EffectFlags.ACTIVE`（活躍中）
   *   - `EffectFlags.DEPS_CHANGED`（依賴已變更）
   * - 透過 `flags`，Vue 3 可以快速判斷 `Subscriber` 是否應該重新運行。
   *
   * @internal
   */
  flags: EffectFlags;

  /**
   * `next` 指向 **下一個 `Subscriber`**，用於管理 **活躍中的 `Subscriber` 鏈表**。
   * - 這讓 Vue 3 能夠更有效率地 **追蹤活躍的 `Effect`**，避免遍歷整個響應式系統。
   *
   * @internal
   */
  next?: Subscriber;

  /**
   * `notify()` 用於通知 `Subscriber`：
   * - 當 `Dep` 發生變化時，這個函數會被觸發，讓 `Subscriber` 執行更新邏輯。
   * - 若回傳 `true`，表示這個 `Subscriber` 是 `computed`，需要通知 `Dep`。
   *
   * 引用至 class ReactiveEffect<T = any>
   *
   * @returns 若回傳 `true`，表示這是 `computed`，需要進一步通知 `Dep`
   *
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

  /**
   * @param fn componentUpdateFn
   */
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
  notify(): void {
    if (
      this.flags & EffectFlags.RUNNING &&
      !(this.flags & EffectFlags.ALLOW_RECURSE)
    ) {
      return;
    }
    if (!(this.flags & EffectFlags.NOTIFIED)) {
      batch(this);
    }
  }
  /**
   * 渲染畫面
   */
  run() {
    // 是否處於活躍狀態
    if (!(this.flags & EffectFlags.ACTIVE)) {
      // stopped during cleanup
      return this.fn();
    }

    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;

    try {
      return this.fn();
    } finally {
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= ~EffectFlags.RUNNING;
    }
  }

  stop(): void {}

  trigger(): void {
    if (this.flags & EffectFlags.PAUSED) {
    } else if (this.scheduler) {
    } else {
      this.runIfDirty();
    }
  }

  /**
   * @internal
   */
  runIfDirty(): void {
    if (isDirty(this)) {
      this.run();
    }
  }

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

// 記錄當前批次的深度（batch depth），用於控制批次更新
let batchDepth = 0;

// 存儲當前累積的 `Subscriber`（副作用函數），用於批次處理
let batchedSub: Subscriber | undefined;

// 存儲當前累積的 `computed` 訂閱者，因為 `computed` 需要特別處理
let batchedComputed: Subscriber | undefined;

/**
 * **批次處理（Batch Processing）**
 *
 * `batch` 用於將 `Subscriber`（副作用函數，如 `Effect` 或 `computed`）加入批次更新機制，
 * 避免重複執行相同的副作用，提升響應式系統的效能。
 *
 * @param sub - 要加入批次的 `Subscriber`（副作用函數）
 * @param isComputed - 是否是 `computed` 計算屬性
 */
export function batch(sub: Subscriber, isComputed = false): void {
  // 標記此 `Subscriber` 為已通知狀態，避免重複處理
  sub.flags |= EffectFlags.NOTIFIED;

  if (isComputed) {
    // 如果是 `computed`，則將其放入 `batchedComputed` 鏈表
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }

  // 如果是一般的 `Effect`，則放入 `batchedSub` 鏈表
  sub.next = batchedSub;
  batchedSub = sub;
}

/**
 * @internal
 */
export function startBatch(): void {
  batchDepth++;
}

/**
 * Run batched effects when all batches have ended
 * @internal
 */
export function endBatch(): void {
  if (--batchDepth > 0) {
    return;
  }

  if (batchedComputed) {
    let e: Subscriber | undefined = batchedComputed;
    batchedComputed = undefined;
    while (e) {
      const next: Subscriber | undefined = e.next;
      e.next = undefined;
      e.flags &= ~EffectFlags.NOTIFIED;
      e = next;
    }
  }

  let error: unknown;
  while (batchedSub) {
    let e: Subscriber | undefined = batchedSub;
    batchedSub = undefined;
    while (e) {
      const next: Subscriber | undefined = e.next;
      e.next = undefined;
      e.flags &= ~EffectFlags.NOTIFIED;
      if (e.flags & EffectFlags.ACTIVE) {
        try {
          // ACTIVE flag is effect-only
          (e as ReactiveEffect).trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }

  if (error) throw error;
}

export let activeSub: Subscriber | undefined;

function isDirty(sub: Subscriber): boolean {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version) {
      return true;
    }
  }
  return false;
}
