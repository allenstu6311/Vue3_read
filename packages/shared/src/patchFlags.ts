export enum PatchFlags {
  /**
   * 表示該元素的 `textContent`（子節點文本內容）是動態的，
   * Vue 可以直接更新該文本，而不需要比較整個子節點樹。
   */
  TEXT = 1,

  /**
   * 表示該元素的 `class` 屬性是動態綁定的。
   */
  CLASS = 1 << 1,

  /**
   * 表示該元素的 `style` 屬性是動態的。
   * 編譯器會預先將靜態的 `style` 轉換為靜態物件，並進行靜態提升。
   * 例如：
   * ```js
   * const style = { color: 'red' }
   * render() { return e('div', { style }) }
   * ```
   */
  STYLE = 1 << 2,

  /**
   * 表示該元素具有非 `class` 或 `style` 的其他動態屬性。
   * 這也適用於組件（無論 props 是否包含 `class` 或 `style`）。
   * 如果該標誌存在，則 `vnode` 也會有 `dynamicProps` 陣列，
   * 其中包含可能會變更的 props 鍵名，以便運行時可以更快地進行比對（無需擔心屬性刪除）。
   */
  PROPS = 1 << 3,

  /**
   * 表示該元素的 props 具有動態鍵名。
   * 當鍵變更時，始終需要進行完整的比對（full diff）。
   * 這個標誌與 `CLASS`、`STYLE` 和 `PROPS` 是互斥的（不能同時存在）。
   */
  FULL_PROPS = 1 << 4,

  /**
   * 表示該元素的 props 需要 hydration（但不一定需要 patch）。
   * 例如：事件監聽器 (`@click`)、帶 `.prop` 修飾符的 `v-bind`。
   */
  NEED_HYDRATION = 1 << 5,

  /**
   * 表示該 Fragment（片段節點）內部的子節點順序不會變動。
   */
  STABLE_FRAGMENT = 1 << 6,

  /**
   * 表示該 Fragment 具有 **帶 key 或部分帶 key** 的子節點。
   */
  KEYED_FRAGMENT = 1 << 7,

  /**
   * 表示該 Fragment 內的子節點 **沒有 key**。
   */
  UNKEYED_FRAGMENT = 1 << 8,

  /**
   * 表示該元素僅需要進行 **非 props 屬性** 的 patch，
   * 例如 `ref` 或指令（如 `onVnodeXXX` 鉤子函式）。
   * 由於每個被 patch 的 `vnode` 都會檢查 `ref` 和 `onVnodeXXX`，
   * 所以該標誌會標記 `vnode`，以便父級的 block 追蹤它。
   */
  NEED_PATCH = 1 << 9,

  /**
   * 表示該組件具有動態插槽（例如：插槽內部引用了 `v-for` 迭代變數，
   * 或者插槽名稱是動態的）。
   * 具有此標誌的組件將會 **始終強制更新**（force update）。
   */
  DYNAMIC_SLOTS = 1 << 10,

  /**
   * 表示該 Fragment 是因為使用者在模板根層級放置了註解而產生的。
   * 這是 **開發模式專用標誌**，因為在生產模式下，註解會被移除。
   */
  DEV_ROOT_FRAGMENT = 1 << 11,

  /**
   * ⚠ **特殊標誌（Special Flags）** ⚠
   * 這些特殊標誌的值為 **負數**。
   * 它們不會與位運算進行匹配（位運算匹配應僅適用於 `patchFlag > 0` 的情況）。
   * 這些標誌之間是 **互斥的**。
   * 若要檢查這些特殊標誌，應該直接判斷 `patchFlag === FLAG`。
   */

  /**
   * 表示該 `vnode` 是 **已緩存的靜態節點**。
   * 這也可作為 hydration（SSR 頁面渲染恢復時）的提示，
   * 告訴 Vue **跳過整個子樹**，因為靜態內容不需要更新。
   */
  CACHED = -1,

  /**
   * 一個特殊標誌，表示 **diff 算法應該退出優化模式**。
   * 例如：
   * - 當 `renderSlot()` 創建的 block Fragment **遇到非編譯器產生的插槽** 時（即手寫的 `render` 函式，這些函式應始終進行完整 diff）。
   * - **手動複製的 VNode**（cloneVNode）。
   */
  BAIL = -2,
}
