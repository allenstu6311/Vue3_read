import { ShapeFlags } from "./../../shared/src/shapeFlags.js";
import { EMPTY_OBJ, isReservedProp, NOOP } from "../../shared/src/general.js";
import { createAppAPI, CreateAppFunction } from "./compat/apiCreateApp.js";
import {
  ComponentInternalInstance,
  createComponentInstance,
  setupComponent,
} from "./component.js";
import { SuspenseBoundary } from "./components/Suspense.js";
import { createHydrationFunctions } from "./hydration.js";
import type {
  VNode,
  VNodeArrayChildren,
  VNodeHook,
  VNodeProps,
} from "./vnode.js";
import {
  cloneIfMounted,
  Fragment,
  isSameVNodeType,
  normalizeVNode,
  Text,
} from "./vnode.js";
import { ReactiveEffect } from "../../reactivity/src/effect.js";
import { SchedulerJob } from "./scheduler.js";
import { isAsyncWrapper } from "./apiAsyncComponent.js";
import { renderComponentRoot } from "./componentRenderUtils.js";
import { PatchFlags } from "../../shared/src/patchFlags.js";

/**
 * RendererNode 可以是任何物件。在核心渲染邏輯中，它不會被直接操作，
 * 而是通過配置中提供的操作函數來處理，因此只需定義為一個通用物件即可
 */
export interface RendererNode {
  [key: string | symbol]: any;
}

type MountChildrenFn = (
  children: VNodeArrayChildren,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  namespace: ElementNamespace,
  slotScopeIds: string[] | null,
  optimized: boolean,
  start?: number
) => void;

export interface RendererElement extends RendererNode {}

export interface Renderer<HostElement = RendererElement> {
  render: RootRenderFunction<HostElement>;
  createApp: CreateAppFunction<HostElement>;
}

type NextFn = (vnode: VNode) => RendererNode | null;

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

type PatchBlockChildrenFn = (
  oldChildren: VNode[],
  newChildren: VNode[],
  fallbackContainer: RendererElement,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  namespace: ElementNamespace,
  slotScopeIds: string[] | null
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
    console.log("type", type);
    console.log("shapeFlag", shapeFlag);
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Fragment:
        processFragment(
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
    // console.log(n1);
    // if (n1 == null) {
    //   hostInsert(
    //     (n2.el = hostCreateText(n2.children as string)),
    //     container,
    //     anchor
    //   );
    // }
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
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & PatchFlags.FULL_PROPS;

    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook: VNodeHook | undefined | null;

    if (
      (oldProps.innerHTML && newProps.innerHTML == null) ||
      (oldProps.textContent && newProps.textContent == null)
    ) {
      hostSetElementText(el, "");
    }

    // if (dynamicChildren) {
    //   patchBlockChildren(
    //     n1.dynamicChildren!,
    //     dynamicChildren,
    //     el,
    //     parentComponent,
    //     parentSuspense,
    //     resolveChildrenNamespace(n2, namespace),
    //     slotScopeIds
    //   );
    // }

    // patchFlag > 0 代表需要經過diff
    if (patchFlag > 0) {
      if (patchFlag & PatchFlags.PROPS) {
        // if the flag is present then dynamicProps must be non-null
        const propsToUpdate = n2.dynamicProps!;
        for (let i = 0; i < propsToUpdate.length; i++) {
          const key = propsToUpdate[i];
          const prev = oldProps[key];
          const next = newProps[key];
          // #1471 force patch value
          if (next !== prev || key === "value") {
            hostPatchProp(el, key, prev, next, namespace, parentComponent);
          }
        }
      }

      // text
      // This flag is matched when the element has only dynamic text children.
      if (patchFlag & PatchFlags.TEXT) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children as string);
        }
      }
    }
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

  const processFragment = (
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
    const fragmentStartAnchor = (n2.el = n1 ? n1.el : hostCreateText(""))!;
    const fragmentEndAnchor = (n2.anchor = n1
      ? n1.anchor
      : hostCreateText(""))!;

    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (n1 == null) {
      /**
       * <fragment> #app </fragment>
       * 讓vue3支援多節點
       */
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        (n2.children || []) as VNodeArrayChildren,
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (
        patchFlag > 0 &&
        patchFlag & PatchFlags.STABLE_FRAGMENT &&
        dynamicChildren &&
        n1.dynamicChildren // 確保前一個 Fragment 不是 BAIL 狀態
      ) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
      }
    }
  };

  const mountChildren: MountChildrenFn = (
    children,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace: ElementNamespace,
    slotScopeIds,
    optimized,
    start = 0
  ) => {
    for (let i = start; i < children.length; i++) {
      const child = (children[i] = optimized // false
        ? cloneIfMounted(children[i] as VNode)
        : normalizeVNode(children[i]));
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
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
        let vnodeHook: VNodeHook | null | undefined;
        const { el, props } = initialVNode;
        const { bm, m, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);

        const subTree = (instance.subTree = renderComponentRoot(instance));

        patch(
          null,
          subTree,
          container,
          anchor,
          instance,
          parentSuspense,
          namespace
        );
        instance.isMounted = true;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;

        patch(
          prevTree,
          nextTree,
          // 可能因 Teleport 改變了父級
          hostParentNode(prevTree.el!)!,
          // 可能因 Fragment 變化導致錨點變更
          getNextHostNode(prevTree),
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
      // unmount邏輯
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

  /**
   * 獲取下一個插入得節點
   * @param vnode
   */
  const getNextHostNode: NextFn = (vnode) => {
    if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
      return getNextHostNode(vnode.component!.subTree);
    }
    // const el = hostNextSibling((vnode.anchor || vnode.el)!)
    return null;
  };

  // The fast path for blocks.
  const patchBlockChildren: PatchBlockChildrenFn = (
    oldChildren,
    newChildren,
    fallbackContainer,
    parentComponent,
    parentSuspense,
    namespace: ElementNamespace,
    slotScopeIds
  ) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      // Determine the container (parent element) for the patch.
      const container = (() => {
        // 如果 oldVNode 沒有 el（表示它可能是錯誤的 async setup() 組件，位於 Suspense 中），則不需要父元素
        if (!oldVNode.el) {
          return fallbackContainer;
        }

        // 1. 如果是 Fragment，則需要提供 Fragment 的父元素，因為它會包含子元素
        if (oldVNode.type === Fragment) {
          return hostParentNode(oldVNode.el)!;
        }

        // 2. 如果是不同類型的節點，會進行替換，這也需要正確的父容器
        if (!isSameVNodeType(oldVNode, newVNode)) {
          return hostParentNode(oldVNode.el)!;
        }

        // 3. 如果是組件或 teleport，這些情況下父容器也是必須的
        if (oldVNode.shapeFlag & (ShapeFlags.COMPONENT | ShapeFlags.TELEPORT)) {
          return hostParentNode(oldVNode.el)!;
        }

        // 如果以上條件都不符合，就返回 fallbackContainer
        return fallbackContainer;
      })();

      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };

  function resolveChildrenNamespace(
    { type, props }: VNode,
    currentNamespace: ElementNamespace
  ): ElementNamespace {
    return (currentNamespace === "svg" && type === "foreignObject") ||
      (currentNamespace === "mathml" &&
        type === "annotation-xml" &&
        props &&
        props.encoding &&
        props.encoding.includes("html"))
      ? undefined
      : currentNamespace;
  }

  return {
    render,
    createApp: createAppAPI(render),
  };
}
