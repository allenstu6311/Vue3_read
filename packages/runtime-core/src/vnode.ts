import { Ref } from "../../reactivity/ref.js"
import { AppContext } from "./compat/apiCreateApp.js"
import { ClassComponent, Component, ComponentInternalInstance } from "./component.js"
import { NULL_DYNAMIC_COMPONENT } from "./helpers/resolveAssets.js"
import { RendererElement, RendererNode } from "./renderer.js"

export const Text: unique symbol = Symbol.for('v-txt')
export const Comment: unique symbol = Symbol.for('v-cmt')
export const Static: unique symbol = Symbol.for('v-stc')

export type VNodeTypes =
  | string
  | VNode
  | Component
  // | typeof Text
  // | typeof Static
  // | typeof Comment
  // | typeof Fragment
  // | typeof Teleport
  // | typeof TeleportImpl
  // | typeof Suspense
  // | typeof SuspenseImpl


  export type VNodeRef =
  | string
  | Ref
  | ((
      ref: Element  | null,
      refs: Record<string, any>,
    ) => void)

  export type VNodeProps = {
    key?: PropertyKey
    ref?: VNodeRef
    ref_for?: boolean
    ref_key?: string
  
    // vnode hooks
    // onVnodeBeforeMount?: VNodeMountHook | VNodeMountHook[]
    // onVnodeMounted?: VNodeMountHook | VNodeMountHook[]
    // onVnodeBeforeUpdate?: VNodeUpdateHook | VNodeUpdateHook[]
    // onVnodeUpdated?: VNodeUpdateHook | VNodeUpdateHook[]
    // onVnodeBeforeUnmount?: VNodeMountHook | VNodeMountHook[]
    // onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[]
  }

export interface VNode<
  HostNode = RendererNode,
  HostElement = RendererElement,
  ExtraProps = { [key: string]: any },
> {
  /**
   * @internal
   */
  __v_isVNode: true

  /**
   * @internal
   */
  // [ReactiveFlags.SKIP]: true

  type: VNodeTypes
  props: (VNodeProps & ExtraProps) | null
  key: PropertyKey | null
  // ref: VNodeNormalizedRef | null
  /**
   * SFC only. This is assigned on vnode creation using currentScopeId
   * which is set alongside currentRenderingInstance.
   */
  scopeId: string | null
  /**
   * SFC only. This is assigned to:
   * - Slot fragment vnodes with :slotted SFC styles.
   * - Component vnodes (during patch/hydration) so that its root node can
   *   inherit the component's slotScopeIds
   * @internal
   */
  slotScopeIds: string[] | null
  // children: VNodeNormalizedChildren
  // component: ComponentInternalInstance | null
  // dirs: DirectiveBinding[] | null
  // transition: TransitionHooks<HostElement> | null

  // DOM
  el: HostNode | null
  anchor: HostNode | null // fragment anchor
  target: HostElement | null // teleport target
  targetStart: HostNode | null // teleport target start anchor
  targetAnchor: HostNode | null // teleport target anchor
  /**
   * number of elements contained in a static vnode
   * @internal
   */
  staticCount: number

  // suspense
  // suspense: SuspenseBoundary | null
  /**
   * @internal
   */
  ssContent: VNode | null
  /**
   * @internal
   */
  ssFallback: VNode | null

  // optimization only
  shapeFlag: number
  patchFlag: number
  /**
   * @internal
   */
  dynamicProps: string[] | null
  /**
   * @internal
   */
  dynamicChildren: (VNode[] & { hasOnce?: boolean }) | null

  // application root node only
  appContext: AppContext | null

  /**
   * @internal lexical scope owner instance
   */
  ctx: ComponentInternalInstance | null

  /**
   * @internal attached by v-memo
   */
  memo?: any[]
  /**
   * @internal index for cleaning v-memo cache
   */
  cacheIndex?: number
  /**
   * @internal __COMPAT__ only
   */
  isCompatRoot?: true
  /**
   * @internal custom element interception hook
   */
  ce?: (instance: ComponentInternalInstance) => void
}


export const createVNode = (
  _createVNode
) as typeof _createVNode

function _createVNode(
  type:VNodeTypes | ClassComponent | typeof  NULL_DYNAMIC_COMPONENT
){}