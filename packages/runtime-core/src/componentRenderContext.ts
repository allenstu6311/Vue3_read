import { ComponentInternalInstance } from "./component.js";

/**
 * 標記資源解析度的目前渲染實例
 */
export let currentRenderingInstance: ComponentInternalInstance | null = null;
export let currentScopeId: string | null = null;
