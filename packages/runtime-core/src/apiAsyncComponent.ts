import { ComponentInternalInstance } from "./component.js";
import { ComponentOptions } from "./componentOptions.js";
import { VNode } from "./vnode.js";

/**
 * 檢查一個組件 (`ComponentInternalInstance` 或 `VNode`) 是否為 **異步組件 (Async Component)**
 * 異步組件會透過 `__asyncLoader` 屬性來標記，這個屬性存放了組件的異步加載函數。
 *
 * @param i - 組件實例 (`ComponentInternalInstance`) 或 `VNode`
 * @returns `true` 表示該組件是異步組件，`false` 表示是一般同步組件
 */
export const isAsyncWrapper = (i: ComponentInternalInstance | VNode): boolean =>
  !!(i.type as ComponentOptions).__asyncLoader;
