/**
 * VNode 類型
 *
 * 使用 `1 << n` 定義標誌值，具備以下優勢：
 * 1. **唯一性**：每個標誌的二進制值互不衝突（如 0001, 0010）。
 * 2. **可組合**：可透過 `|` 合併多個標誌，靈活表示特徵。
 * 3. **高效判斷**：使用 `&` 快速檢查標誌，比 `if` 判斷更快。
 * 4. **節省內存**：所有標誌存儲在單個數值內，減少額外開銷。
 * 5. **易擴展**：新增標誌時可繼續使用 `1 << n`，不影響現有標誌。
 *
 * 這種設計讓 Vue 內部標誌管理更靈活且高效。
 */
export enum ShapeFlags {
  /**
   * 普通的 DOM
   */
  ELEMENT = 1,
  /**
   * 無狀態函式型組件
   */
  FUNCTIONAL_COMPONENT = 1 << 1,
  /**
   * 有狀態的組件
   */
  STATEFUL_COMPONENT = 1 << 2,
  /**
   * 純文字。
   */
  TEXT_CHILDREN = 1 << 3,
  /**
   * 陣列
   */
  ARRAY_CHILDREN = 1 << 4,
  /**
   * slot 插槽
   */
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  /**
   * 這是一個組件，無論是函式型組件還是有狀態
   */
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
