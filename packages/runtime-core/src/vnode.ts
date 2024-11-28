import { ShapeFlags } from "./../../shared/src/shapeFlags.js";
import { isRef, Ref } from "../../reactivity/ref.js";
import { AppContext } from "./compat/apiCreateApp.js";
import {
  ClassComponent,
  Component,
  ComponentInternalInstance,
  Data,
} from "./component.js";
import { NULL_DYNAMIC_COMPONENT } from "./helpers/resolveAssets.js";
import { RendererElement, RendererNode } from "./renderer.js";
import { isFunction, isObject, isString } from "../../shared/src/general.js";
import {
  currentRenderingInstance,
  currentScopeId,
} from "./componentRenderContext.js";
import { RawSlots } from "./componentSlots.js";

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

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;

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
  // [ReactiveFlags.SKIP]: true

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
  // component: ComponentInternalInstance | null
  // dirs: DirectiveBinding[] | null
  // transition: TransitionHooks<HostElement> | null

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
  // suspense: SuspenseBoundary | null
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
