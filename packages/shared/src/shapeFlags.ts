/**
 * ShapeFlags 枚舉
 *
 * 使用 `1 << n`（位運算）來定義每個標誌的值，主要原因如下：
 *
 * 1. **唯一性與無衝突**:
 *    - 每個標誌值的二進制表示形式只有一個位是 1（例如：0001, 0010, 0100）。
 *    - 確保每個標誌在內部具有唯一的表示，避免重複或衝突。
 *
 * 2. **可組合性**:
 *    - 可以通過位或運算（`|`）將多個標誌組合在一起，靈活表示多重特徵。
 *    - 例如 `ShapeFlags.COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT`。
 *
 * 3. **高效性**:
 *    - 使用位運算（`&`）快速檢測某個標誌是否存在，比傳統條件判斷（如多次 `if` 判斷）效率更高。
 *    - 例如：`if (vnode.shapeFlag & ShapeFlags.ELEMENT)`。
 *
 * 4. **節省內存**:
 *    - 多個標誌可以壓縮到一個整數中，而不需要額外的結構或字段來存儲多個特徵。
 *
 * 5. **便於擴展**:
 *    - 新增標誌時只需添加 `1 << n`，未來擴展不會與現有標誌重疊或衝突。
 *
 * 總結：
 * 位運算設計讓 ShapeFlags 更高效、更靈活，特別適合框架內部頻繁判斷與操作的場景。
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
