import { ComputedRefImpl } from "./computed.js";
import {
  activeSub,
  DebuggerEventExtraInfo,
  EffectFlags,
  endBatch,
  shouldTrack,
  startBatch,
  Subscriber,
} from "./effect.js";

/**
 * `Link` 負責管理 Vue 3 響應式系統中的 `Dep`（依賴）與 `Subscriber`（訂閱者）之間的關係。
 *
 * Vue 3 的響應式系統使用 **依賴追蹤**（Dependency Tracking）來決定哪些 `Effect` 或 `Computed`
 * 需要在數據變化時重新執行，而 `Link` 則是用來存儲 `Dep` 與 `Subscriber` 之間的對應關係。
 *
 * `Dep`（依賴）代表響應式數據（如 `reactive()` 內的某個屬性）。
 * `Subscriber`（訂閱者）代表依賴該數據的計算（如 `computed()` 或 `watchEffect()`）。
 *
 * ## 主要功能：
 * 1. **每個 `Link` 代表 `Dep` 和 `Subscriber` 的一個具體關係**（因為多個 `Dep` 可能影響同一個 `Subscriber`）。
 * 2. **雙向鏈結**：`Link` 既儲存 `Dep` 追蹤的 `Subscriber`，也儲存 `Subscriber` 依賴的 `Dep`。
 * 3. **版本管理**：`version` 控制 `Dep` 是否仍然被 `Subscriber` 依賴，沒被使用的 `Link` 會被移除。
 */
export class Link {
  /**
   * `version` 用於管理 `Dep` 與 `Subscriber` 的狀態：
   * - **在 effect 執行前**，所有 `Link` 的 `version` 會被重設為 `-1`（代表尚未被使用）。
   * - **在 effect 執行過程中**，當 `Dep` 被訪問時，會將 `Link.version` 設為 `Dep.version`。
   * - **在 effect 執行後**，若 `Link.version === -1`（代表沒被使用），則這個 `Link` 會被清除。
   */
  version: number;

  /**
   * **依賴（Dep）鏈表指標**
   * - `Dep` 會有多個 `Subscriber`，這些 `Subscriber` 形成一個雙向鏈結串列。
   * - `nextDep` 指向 **下一個** 依賴相同 `Dep` 的 `Link`。
   * - `prevDep` 指向 **上一個** 依賴相同 `Dep` 的 `Link`。
   */
  nextDep?: Link;
  prevDep?: Link;

  /**
   * **訂閱者（Subscriber）鏈表指標**
   * - `Subscriber` 可能依賴多個 `Dep`，這些 `Dep` 形成一個雙向鏈結串列。
   * - `nextSub` 指向 **下一個** 由相同 `Subscriber` 訂閱的 `Link`。
   * - `prevSub` 指向 **上一個** 由相同 `Subscriber` 訂閱的 `Link`。
   */
  nextSub?: Link;
  prevSub?: Link;

  /**
   * **作用中的 `Link` 指標**
   * - `prevActiveLink` 指向上一次作用的 `Link`，這樣可以在 `Effect` 內快速找到上次使用的依賴。
   */
  prevActiveLink?: Link;

  /**
   * 建立 `Link`，將 `Subscriber`（訂閱者）與 `Dep`（依賴）綁定。
   *
   * @param sub 訂閱者（Effect 或 Computed）
   * @param dep 依賴的 `Dep`
   */
  constructor(public sub: Subscriber, public dep: Dep) {
    // 初始化時，`version` 會跟 `Dep` 的 `version` 同步
    this.version = dep.version;

    // 初始化所有鏈結為 `undefined`
    this.nextDep =
      this.prevDep =
      this.nextSub =
      this.prevSub =
      this.prevActiveLink =
        undefined;
  }
}

// The main WeakMap that stores {target -> key -> dep} connections.
// Conceptually, it's easier to think of a dependency as a Dep class
// which maintains a Set of subscribers, but we simply store them as
// raw Maps to reduce memory overhead.
type KeyToDepMap = Map<any, Dep>;

/**
 * Incremented every time a reactive change happens
 * This is used to give computed a fast path to avoid re-compute when nothing
 * has changed.
 */
export let globalVersion = 0;

/**
 * @internal
 */
export class Dep {
  /**
   * 版本號（每次變更時 +1）
   * - 用於響應式系統的依賴追蹤，確保 `Subscriber` 只在 `Dep` 變更時重新運行
   */
  version = 0;
  /**
   * 當前活躍的 `Link`
   */
  activeLink?: Link = undefined;

  /**
   * 用來管理有哪些 `Subscriber` 依賴這個 `Dep`
   */
  subs?: Link = undefined;

  /**
   * Doubly linked list representing the subscribing effects (head)
   * DEV only, for invoking onTrigger hooks in correct order
   */
  subsHead?: Link;

  /**
   * For object property deps cleanup
   */
  map?: KeyToDepMap = undefined;
  key?: unknown = undefined;

  /**
   * 記錄 `Dep` 有多少個 `Subscriber
   */
  sc: number = 0;

  constructor(public computed?: ComputedRefImpl | undefined) {}
  /**
   * 當 `Subscriber` 讀取 `Dep` 時，會呼叫 `track()
   */
  track(debugInfo?: DebuggerEventExtraInfo): Link | undefined {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }

    let link = this.activeLink;

    if (link === undefined || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);

      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      }
      addSub(link);
    }

    return link;
  }
  /**
   * 當 `Dep`（響應式數據）變更時，會呼叫 `trigger()` 通知所有 `Subscriber
   */
  trigger(debugInfo?: DebuggerEventExtraInfo): void {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  /**
   * 讓所有訂閱該 `Dep` 的 `Effect` 或 `computed` 重新執行
   */
  notify(debugInfo?: DebuggerEventExtraInfo): void {
    startBatch();

    try {
      for (let link = this.subs; link; link = link.prevSub) {
        console.log("link", link.sub);

        if (link.sub.notify()) {
          // 如果 `notify()` 回傳 `true`，代表這個 `Subscriber` 是 `computed`
          // 需要進一步通知 `Dep`，確保 `computed` 內的依賴也能更新
          (link.sub as ComputedRefImpl).dep.notify();
        }
      }
    } finally {
      // 觸發ReactiveEffect trigger
      endBatch();
    }
  }
}

function addSub(link: Link) {
  link.dep.sc++;

  // 是否處於追蹤狀態
  if (link.sub.flags & EffectFlags.TRACKING) {
    link.dep.subs = link;
  }
}

/**
 * Finds all deps associated with the target (or a specific property) and
 * triggers the effects stored within.
 *
 * @param target - The reactive object.
 * @param type - Defines the type of the operation that needs to trigger effects.
 * @param key - Can be used to target a specific reactive property in the target object.
 */
export function trigger() {}
