import { ComponentInternalInstance } from "../component.js";
import {
  ElementNamespace,
  MoveType,
  RendererElement,
  RendererNode,
  SetupRenderEffectFn,
} from "../renderer.js";
import { VNode } from "../vnode.js";

export interface SuspenseProps {
  onResolve?: () => void;
  onPending?: () => void;
  onFallback?: () => void;
  timeout?: string | number;
  /**
   * Allow suspense to be captured by parent suspense
   *
   * @default false
   */
  suspensible?: boolean;
}

export interface SuspenseBoundary {
  vnode: VNode<RendererNode, RendererElement, SuspenseProps>;
  parent: SuspenseBoundary | null;
  parentComponent: ComponentInternalInstance | null;
  namespace: ElementNamespace;
  container: RendererElement;
  hiddenContainer: RendererElement;
  activeBranch: VNode | null;
  pendingBranch: VNode | null;
  deps: number;
  pendingId: number;
  timeout: number;
  isInFallback: boolean;
  isHydrating: boolean;
  isUnmounted: boolean;
  effects: Function[];
  resolve(force?: boolean, sync?: boolean): void;
  fallback(fallbackVNode: VNode): void;
  move(
    container: RendererElement,
    anchor: RendererNode | null,
    type: MoveType
  ): void;
  next(): RendererNode | null;
  registerDep(
    instance: ComponentInternalInstance,
    setupRenderEffect: SetupRenderEffectFn,
    optimized: boolean
  ): void;
  unmount(parentSuspense: SuspenseBoundary | null, doRemove?: boolean): void;
}
