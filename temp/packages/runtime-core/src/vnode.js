import { ShapeFlags } from "./../../shared/src/shapeFlags.js";
import { isRef } from "../../reactivity/src/ref.js";
import { NULL_DYNAMIC_COMPONENT } from "./helpers/resolveAssets.js";
import { isFunction, isObject, isString } from "../../shared/src/general.js";
import { currentRenderingInstance, currentScopeId, } from "./componentRenderContext.js";
export const Fragment = Symbol.for("v-fgt");
export const Text = Symbol.for("v-txt");
export const Comment = Symbol.for("v-cmt");
export const Static = Symbol.for("v-stc");
export const createVNode = _createVNode;
export function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref, ref_key, ref_for, }) => {
    if (typeof ref === "number") {
        ref = "" + ref;
    }
    return (ref != null
        ? isString(ref) || isRef(ref) || isFunction(ref)
            ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for }
            : ref
        : null);
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT, isBlockNode = false, needFullChildrenNormalization = false) {
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
    };
    return vnode;
}
export { createBaseVNode as createElementVNode };
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
        type = Comment;
    }
    // if (isVNode(type)){}
    /**
     * 替vnode做標記，不用再次判斷需要用哪種渲染方式
     * 一般{{ test }} 都是回傳4但還有很多狀況
     */
    const shapeFlag = isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0;
    return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
