import { Ref } from "../../reactivity/src/ref.js";
import { AppContext } from "./compat/apiCreateApp.js";
import { ClassComponent, Component, ComponentInternalInstance, Data } from "./component.js";
import { NULL_DYNAMIC_COMPONENT } from "./helpers/resolveAssets.js";
import { RendererElement, RendererNode } from "./renderer.js";
import { RawSlots } from "./componentSlots.js";
export declare const Fragment: {
    __isFragment: true;
    new (): {
        $props: VNodeProps;
    };
};
export declare const Text: unique symbol;
export declare const Comment: unique symbol;
export declare const Static: unique symbol;
export type VNodeTypes = string | VNode | Component | typeof Text | typeof Static | typeof Comment | typeof Fragment;
export type VNodeRef = string | Ref | ((ref: Element | null, refs: Record<string, any>) => void);
export type VNodeProps = {
    key?: PropertyKey;
    ref?: VNodeRef;
    ref_for?: boolean;
    ref_key?: string;
};
type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void;
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;
export type VNodeChild = VNodeChildAtom | VNodeArrayChildren;
export type VNodeNormalizedChildren = string | VNodeArrayChildren | RawSlots | null;
export type VNodeNormalizedRef = VNodeNormalizedRefAtom | VNodeNormalizedRefAtom[];
export interface VNode<HostNode = RendererNode, HostElement = RendererElement, ExtraProps = {
    [key: string]: any;
}> {
    /**
     * @internal
     */
    __v_isVNode: true;
    /**
     * @internal
     */
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
    el: HostNode | null;
    anchor: HostNode | null;
    target: HostElement | null;
    targetStart: HostNode | null;
    targetAnchor: HostNode | null;
    /**
     * number of elements contained in a static vnode
     * @internal
     */
    staticCount: number;
    /**
     * @internal
     */
    ssContent: VNode | null;
    /**
     * @internal
     */
    ssFallback: VNode | null;
    shapeFlag: number;
    patchFlag: number;
    /**
     * @internal
     */
    dynamicProps: string[] | null;
    /**
     * @internal
     */
    dynamicChildren: (VNode[] & {
        hasOnce?: boolean;
    }) | null;
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
export declare const createVNode: typeof _createVNode;
export declare function isVNode(value: any): value is VNode;
declare function createBaseVNode(type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT, props?: (Data & VNodeProps) | null, children?: unknown, patchFlag?: number, dynamicProps?: string[] | null, shapeFlag?: number, isBlockNode?: boolean, needFullChildrenNormalization?: boolean): VNode;
export { createBaseVNode as createElementVNode };
declare function _createVNode(type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT, props?: (Data & VNodeProps) | null, children?: unknown, patchFlag?: number, dynamicProps?: string[] | null, isBlockNode?: boolean): VNode;
