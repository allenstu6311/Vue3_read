import { ShapeFlags } from "./../../shared/src/shapeFlags.js";
import { isReservedProp, NOOP } from "../../shared/src/general.js";
import { createAppAPI, CreateAppFunction } from "./compat/apiCreateApp.js";
import {
  ComponentInternalInstance,
  createComponentInstance,
  setupComponent,
} from "./component.js";
import { SuspenseBoundary } from "./components/Suspense.js";
import { createHydrationFunctions } from "./hydration.js";
import type { VNode, VNodeHook, VNodeProps } from "./vnode.js";
import { Text } from "./vnode.js";
import { ReactiveEffect } from "../../reactivity/src/effect.js";
import { SchedulerJob } from "./scheduler.js";
import { isAsyncWrapper } from "./apiAsyncComponent.js";
import { renderComponentRoot } from "./componentRenderUtils.js";

/**
 * RendererNode 可以是任何物件。在核心渲染邏輯中，它不會被直接操作，
 * 而是通過配置中提供的操作函數來處理，因此只需定義為一個通用物件即可
 */
export interface RendererNode {
  [key: string | symbol]: any;
}

export interface RendererElement extends RendererNode {}

export interface Renderer<HostElement = RendererElement> {
  render: RootRenderFunction<HostElement>;
  createApp: CreateAppFunction<HostElement>;
}

export enum MoveType {
  ENTER,
  LEAVE,
  REORDER,
}

export type SetupRenderEffectFn = (
  instance: ComponentInternalInstance,
  initialVNode: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentSuspense: SuspenseBoundary | null,
  namespace: ElementNamespace,
  optimized: boolean
) => void;

export type ElementNamespace = "svg" | "mathml" | undefined;

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode | null,
  container: HostElement,
  namespace?: ElementNamespace
) => void;

export interface HydrationRenderer extends Renderer<Element | ShadowRoot> {}

type UnmountFn = (
  vnode: VNode,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: any | null, //SuspenseBoundary
  doRemove?: boolean,
  optimized?: boolean
) => void;

type PatchFn = (
  n1: VNode | null, // null means this is a mount
  n2: VNode,
  container: RendererElement,
  anchor?: RendererNode | null,
  parentComponent?: ComponentInternalInstance | null,
  parentSuspense?: SuspenseBoundary | null,
  namespace?: ElementNamespace,
  slotScopeIds?: string[] | null,
  optimized?: boolean
) => void;

type ProcessTextOrCommentFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  patchProp(
    el: HostElement,
    key: string,
    prevValue: any,
    nextValue: any,
    namespace?: ElementNamespace,
    parentComponent?: ComponentInternalInstance | null
  ): void;
  insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void;
  remove(el: HostNode): void;
  createElement(
    type: string,
    namespace?: ElementNamespace,
    isCustomizedBuiltIn?: string,
    vnodeProps?: (VNodeProps & { [key: string]: any }) | null
  ): HostElement;
  createText(text: string): HostNode;
  createComment(text: string): HostNode;
  setText(node: HostNode, text: string): void;
  setElementText(node: HostElement, text: string): void;
  parentNode(node: HostNode): HostElement | null;
  nextSibling(node: HostNode): HostNode | null;
  querySelector?(selector: string): HostElement | null;
  setScopeId?(el: HostElement, id: string): void;
  cloneNode?(node: HostNode): HostNode;
  insertStaticContent?(
    content: string,
    parent: HostElement,
    anchor: HostNode | null,
    namespace: ElementNamespace,
    start?: HostNode | null,
    end?: HostNode | null
  ): [HostNode, HostNode];
}

export type MountComponentFn = (
  initialVNode: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  namespace: ElementNamespace,
  optimized: boolean
) => void;

export function createRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement
>(options: RendererOptions<HostNode, HostElement>): Renderer<HostElement> {
  return baseCreateRenderer<HostNode, HostElement>(options);
}

function baseCreateRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement
>(options: RendererOptions<HostNode, HostElement>): Renderer<HostElement>;

function baseCreateRenderer(
  options: RendererOptions,
  createHydrationFns?: typeof createHydrationFunctions
): any {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent,
  } = options;

  const patch: PatchFn = (
    n1, // 舊節點
    n2, // 新節點
    container,
    anchor = null,
    parentComponent = null,
    parentSuspense = null,
    namespace = undefined,
    slotScopeIds = null,
    optimized = !!n2.dynamicChildren
  ) => {
    if (n1 === n2) {
      return;
    }

    const { type, ref, shapeFlag } = n2;
    // console.log("type", type);
    // console.log("shapeFlag", shapeFlag);
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
        break;
    }
  };

  const processText: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {
    console.log(n1);

    if (n1 == null) {
      hostInsert(
        (n2.el = hostCreateText(n2.children as string)),
        container,
        anchor
      );
    }
  };

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    namespace: ElementNamespace,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      patchElement(
        n1,
        n2,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };

  const mountElement = (
    vnode: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    namespace: ElementNamespace,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {
    let el: RendererElement;
    let vnodeHook: VNodeHook | undefined | null;
    const { props, shapeFlag, transition, dirs } = vnode;
    // console.log("shapeFlag", shapeFlag);

    el = vnode.el = hostCreateElement(
      vnode.type as string,
      namespace,
      props && props.is,
      props
    );

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children as string);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    }

    // scopeId
    // setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);

    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
    }

    hostInsert(el, container, anchor);
  };

  const setScopeId = (
    el: RendererElement,
    vnode: VNode,
    scopeId: string | null,
    slotScopeIds: string[] | null,
    parentComponent: ComponentInternalInstance | null
  ) => {
    if (parentComponent) {
      let subTree = parentComponent.subTree;
    }
  };

  const patchElement = (
    n1: VNode,
    n2: VNode,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    namespace: ElementNamespace,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {
    const el = (n2.el = n1.el!);
    // console.log("el", el);
  };

  const processComponent = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    namespace: ElementNamespace,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {
    if (n1 == null) {
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      // 更新vnode邏輯
    }
  };

  const mountComponent: MountComponentFn = (
    initialVNode,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace: ElementNamespace,
    optimized
  ) => {
    const compatMountInstance = false;

    const instance: ComponentInternalInstance =
      compatMountInstance ||
      (initialVNode.component = createComponentInstance(
        initialVNode,
        parentComponent,
        parentSuspense
      ));

    if (!compatMountInstance) {
      setupComponent(instance, false);
    }
    setupRenderEffect(
      instance,
      initialVNode,
      container,
      anchor,
      parentSuspense,
      namespace,
      optimized
    );
  };

  const setupRenderEffect: SetupRenderEffectFn = (
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    namespace: ElementNamespace,
    optimized
  ) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        console.log("componentUpdateFn");
        let vnodeHook: VNodeHook | null | undefined;
        const { el, props } = initialVNode;
        const { bm, m, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        const subTree = (instance.subTree = renderComponentRoot(instance));
        console.log("subTree", subTree);
        patch(
          null,
          subTree,
          container,
          anchor,
          instance,
          parentSuspense,
          namespace
        );
      }
    };
    // create reactive effect for rendering
    instance.scope.on();
    const effect = (instance.effect = new ReactiveEffect(componentUpdateFn));
    instance.scope.off();

    const update = (instance.update = effect.run.bind(effect));
    const job: SchedulerJob = (instance.job = effect.runIfDirty.bind(effect));
    job.i = instance;
    job.id = instance.uid;
    update();
  };

  const unmount: UnmountFn = () => {};

  const render: RootRenderFunction = (vnode, container, namespace) => {
    if (vnode == null) {
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
  };

  return {
    render,
    createApp: createAppAPI(render),
  };
}
