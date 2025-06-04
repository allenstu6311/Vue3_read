import { isArray } from "../../shared/src/general.js";
import { ComponentInternalInstance } from "./component.js";

export enum SchedulerJobFlags {
  /** 已加入排程隊列中 */
  QUEUED = 1 << 0,

  /** 屬於 pre-flush 階段的任務（例如組件更新、watch 前置處理等） */
  PRE = 1 << 1,

  /**
   * 允許此 effect 任務在由排程器管理時遞迴觸發自己。
   *
   * 預設情況下，任務無法遞迴觸發自身，這是為了避免某些內建操作（例如 Array.prototype.push）
   * 會在寫入時同時觸發讀取，進而導致混淆的無限循環 (#1740)。
   *
   * 合理允許遞迴觸發的情況有兩種：
   * - 組件的更新函數：父組件更新 props → 觸發子組件更新 → 子組件的 pre-watch callback 對 state 變更 → 影響父組件 (#1801)
   * - watch callback：watch 並不追蹤自身依賴，因此若其自己再次觸發，是使用者刻意設計的遞迴邏輯，並應負責確保最終穩定 (#1727)
   */
  ALLOW_RECURSE = 1 << 2,

  /** 此任務已被標記為無效或已清除，不應再執行 */
  DISPOSED = 1 << 3,
}

export interface SchedulerJob extends Function {
  id?: number;
  /**
   * flags can technically be undefined, but it can still be used in bitwise
   * operations just like 0.
   */
  flags?: SchedulerJobFlags;
  /**
   * Attached by renderer.ts when setting up a component's render effect
   * Used to obtain component information when reporting max recursive updates.
   */
  i?: ComponentInternalInstance;
}

export type SchedulerJobs = SchedulerJob | SchedulerJob[];

const queue: SchedulerJob[] = [];
let flushIndex = -1;

const pendingPostFlushCbs: SchedulerJob[] = [];
let activePostFlushCbs: SchedulerJob[] | null = null;
let postFlushIndex = 0;

const resolvedPromise = /*@__PURE__*/ Promise.resolve() as Promise<any>;
let currentFlushPromise: Promise<void> | null = null;
type CountMap = Map<SchedulerJob, number>;

function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}

export function queuePostFlushCb(cb: SchedulerJobs): void {
  if (!isArray(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
    } else if (!(cb.flags! & SchedulerJobFlags.QUEUED)) {
      pendingPostFlushCbs.push(cb);
      cb.flags! |= SchedulerJobFlags.QUEUED;
    }
  } else {
  }
  queueFlush();
}

export function flushPostFlushCbs(seen?: CountMap): void {
  if (pendingPostFlushCbs.length) {
    //去除重複元素 + 用id排序
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );

    pendingPostFlushCbs.length = 0;
    activePostFlushCbs = deduped;

    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      const cb = activePostFlushCbs[postFlushIndex];

      if (!(cb.flags! & SchedulerJobFlags.DISPOSED)) cb();
    }

    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}

const getId = (job: SchedulerJob): number =>
  job.id == null
    ? job.flags! & SchedulerJobFlags.PRE
      ? -1
      : Infinity
    : job.id;

/**
 * 執行所有更新 job
 */
function flushJobs(seen?: CountMap) {
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      // 處理queue中的每個任務
    }
  } finally {
    flushPostFlushCbs(seen);
    currentFlushPromise = null;
  }
}
