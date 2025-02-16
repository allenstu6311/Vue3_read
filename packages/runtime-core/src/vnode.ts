import { ShapeFlags } from "./../../shared/src/shapeFlags.js";
import { isRef, Ref } from "../../reactivity/src/ref.js";
import { AppContext } from "./compat/apiCreateApp.js";
import {
  ClassComponent,
  Component,
  ComponentInternalInstance,
  Data,
} from "./component.js";
import { NULL_DYNAMIC_COMPONENT } from "./helpers/resolveAssets.js";
import { RendererElement, RendererNode } from "./renderer.js";
import {
  EMPTY_ARR,
  isArray,
  isFunction,
  isObject,
  isString,
} from "../../shared/src/general.js";
import {
  currentRenderingInstance,
  currentScopeId,
} from "./componentRenderContext.js";
import { RawSlots } from "./componentSlots.js";
import { PatchFlags } from "../../shared/src/patchFlags.js";
import { ReactiveFlags } from "../../reactivity/src/constants.js";
import { SuspenseBoundary } from "./components/Suspense.js";

export const Fragment = Symbol.for("v-fgt") as any as {
  __isFragment: true;
  new (): {
    $props: VNodeProps;
  };
};

export const Text: unique symbol = Symbol.for("v-txt");
export const Comment: unique symbol = Symbol.for("v-cmt");
export const Static: unique symbol = Symbol.for("v-stc");

export type VNodeTypes =
  | string
  | VNode
  | Component
  | typeof Text
  | typeof Static
  | typeof Comment
  | typeof Fragment;
// | typeof Teleport
// | typeof TeleportImpl
// | typeof Suspense
// | typeof SuspenseImpl

export type VNodeRef =
  | string
  | Ref
  | ((ref: Element | null, refs: Record<string, any>) => void);

export type VNodeProps = {
  key?: PropertyKey;
  ref?: VNodeRef;
  ref_for?: boolean;
  ref_key?: string;

  // vnode hooks
  // onVnodeBeforeMount?: VNodeMountHook | VNodeMountHook[]
  // onVnodeMounted?: VNodeMountHook | VNodeMountHook[]
  // onVnodeBeforeUpdate?: VNodeUpdateHook | VNodeUpdateHook[]
  // onVnodeUpdated?: VNodeUpdateHook | VNodeUpdateHook[]
  // onVnodeBeforeUnmount?: VNodeMountHook | VNodeMountHook[]
  // onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[]
};

type VNodeChildAtom =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | void;

type VNodeMountHook = (vnode: VNode) => void;

export type VNodeHook = VNodeMountHook | VNodeMountHook[];

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren;

export type VNodeNormalizedChildren =
  | string
  | VNodeArrayChildren
  | RawSlots
  | null;

export type VNodeNormalizedRef =
  | VNodeNormalizedRefAtom
  | VNodeNormalizedRefAtom[];

export interface VNode<
  HostNode = RendererNode,
  HostElement = RendererElement,
  ExtraProps = { [key: string]: any }
> {
  /**
   * @internal
   */
  __v_isVNode: true;

  /**
   * @internal
   */
  [ReactiveFlags.SKIP]: true;

  type: VNodeTypes;
  props: (VNodeProps & ExtraProps) | null;
  key: PropertyKey | null;
  ref: VNodeNormalizedRef | null;
  /**
   * SFC only. This is assigned on vnode creation using currentScopeId
   * which is set alongside currentRenderingInstance.
   */
  scopeId: string | null;
  /**
   * SFC only. This is assigned to:
   * - Slot fragment vnodes with :slotted SFC styles.
   * - Component vnodes (during patch/hydration) so that its root node can
   *   inherit the component's slotScopeIds
   * @internal
   */
  slotScopeIds: string[] | null;
  children: VNodeNormalizedChildren;
  component: ComponentInternalInstance | null;
  dirs: any;
  transition: any;

  // DOM
  el: HostNode | null;
  anchor: HostNode | null; // fragment anchor
  target: HostElement | null; // teleport target
  targetStart: HostNode | null; // teleport target start anchor
  targetAnchor: HostNode | null; // teleport target anchor
  /**
   * number of elements contained in a static vnode
   * @internal
   */
  staticCount: number;

  // suspense
  suspense: SuspenseBoundary | null;
  /**
   * @internal
   */
  ssContent: VNode | null;
  /**
   * @internal
   */
  ssFallback: VNode | null;

  // optimization only
  shapeFlag: number;
  patchFlag: number;
  /**
   * @internal
   */
  dynamicProps: string[] | null;
  /**
   * @internal
   */
  dynamicChildren: (VNode[] & { hasOnce?: boolean }) | null;

  // application root node only
  appContext: AppContext | null;

  /**
   * @internal lexical scope owner instance
   */
  ctx: ComponentInternalInstance | null;

  /**
   * @internal attached by v-memo
   */
  memo?: any[];
  /**
   * @internal index for cleaning v-memo cache
   */
  cacheIndex?: number;
  /**
   * @internal __COMPAT__ only
   */
  isCompatRoot?: true;
  /**
   * @internal custom element interception hook
   */
  ce?: (instance: ComponentInternalInstance) => void;
}

export type VNodeNormalizedRefAtom = {
  /**
   * component instance
   */
  i: ComponentInternalInstance;
  /**
   * Actual ref
   */
  r: VNodeRef;
  /**
   * setup ref key
   */
  k?: string;
  /**
   * refInFor marker
   */
  f?: boolean;
};

export const blockStack: VNode["dynamicChildren"][] = [];
export let currentBlock: VNode["dynamicChildren"] = null;

/**
 * Open a block.
 * This must be called before `createBlock`. It cannot be part of `createBlock`
 * because the children of the block are evaluated before `createBlock` itself
 * is called. The generated code typically looks like this:
 *
 * ```js
 * function render() {
 *   return (openBlock(),createBlock('div', null, [...]))
 * }
 * ```
 * disableTracking is true when creating a v-for fragment block, since a v-for
 * fragment always diffs its children.
 *
 * @private
 */
export function openBlock(disableTracking = false): void {
  blockStack.push((currentBlock = disableTracking ? null : []));
}

export function closeBlock(): void {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}

export let isBlockTreeEnabled = 1;

function setupBlock(vnode: VNode) {
  // save current block children on the block vnode
  vnode.dynamicChildren =
    isBlockTreeEnabled > 0 ? currentBlock || (EMPTY_ARR as any) : null;

  closeBlock();
  // a block is always going to be patched, so track it as a child of its
  // parent block
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}

/**
 * @private
 */
export function createElementBlock(
  type: string | typeof Fragment,
  props?: Record<string, any> | null,
  children?: any,
  patchFlag?: number,
  dynamicProps?: string[],
  shapeFlag?: number
): VNode {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true /* isBlock */
    )
  );
}

export const createVNode = _createVNode as typeof _createVNode;

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false;
}

const normalizeKey = ({ key }: VNodeProps): VNode["key"] =>
  key != null ? key : null;

const normalizeRef = ({
  ref,
  ref_key,
  ref_for,
}: VNodeProps): VNodeNormalizedRefAtom | null => {
  if (typeof ref === "number") {
    ref = "" + ref;
  }
  return (
    ref != null
      ? isString(ref) || isRef(ref) || isFunction(ref)
        ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for }
        : ref
      : null
  ) as any;
};

function createBaseVNode(
  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  shapeFlag: number = type === Fragment ? 0 : ShapeFlags.ELEMENT,
  isBlockNode = false,
  needFullChildrenNormalization = false
): VNode {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance,
  } as VNode;

  if (needFullChildrenNormalization) {
  } else if (children) {
    vnode.shapeFlag |= isString(children)
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN;
  }

  return vnode;
}

export { createBaseVNode as createElementVNode };

function _createVNode(
  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false
): VNode {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }

  // if (isVNode(type)){}

  /**
   * 替vnode做標記，不用再次判斷需要用哪種渲染方式
   * 一般{{ test }} 都是回傳4但還有很多狀況
   */
  const shapeFlag = isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0;

  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}

export function normalizeVNode(child: VNodeChild): VNode {
  if (isArray(child)) {
    console.log("isArray");
  } else if (isVNode(child)) {
    // already vnode, this should be the most common since compiled templates
    // always produce all-vnode children arrays
    return cloneIfMounted(child);
  }
  return null as any;
}

// optimized normalization for template-compiled render fns
export function cloneIfMounted(child: VNode): VNode {
  console.log("cloneIfMounted", child);

  return (child.el === null && child.patchFlag !== PatchFlags.CACHED) ||
    child.memo
    ? child
    : cloneVNode(child);
}

export function cloneVNode<T, U>(
  vnode: VNode<T, U>,
  extraProps?: (Data & VNodeProps) | null,
  mergeRef = false,
  cloneTransition = false
): VNode<T, U> {
  console.log("cloneVNode");

  const { props, ref, patchFlag, children, transition } = vnode;
  const mergedProps = props;
  const cloned: VNode<T, U> = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: ref,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children: children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag:
      extraProps && vnode.type !== Fragment
        ? patchFlag === PatchFlags.CACHED // hoisted node
          ? PatchFlags.FULL_PROPS
          : patchFlag | PatchFlags.FULL_PROPS
        : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,

    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce,
  };

  return cloned;
}
