import { ShapeFlags } from "./../../shared/src/shapeFlags.js";
import { NOOP } from "../../shared/src/general.js";
import { createAppAPI } from "./compat/apiCreateApp.js";
import { createComponentInstance, setupComponent, } from "./component.js";
import { Text } from "./vnode.js";
export var MoveType;
(function (MoveType) {
    MoveType[MoveType["ENTER"] = 0] = "ENTER";
    MoveType[MoveType["LEAVE"] = 1] = "LEAVE";
    MoveType[MoveType["REORDER"] = 2] = "REORDER";
})(MoveType || (MoveType = {}));
export function createRenderer(options) {
    return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
    const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent, } = options;
    const patch = (n1, // 舊節點
    n2, // 新節點
    container, anchor = null, parentComponent = null, parentSuspense = null, namespace = undefined, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
        if (n1 === n2) {
            return;
        }
        const { type, ref, shapeFlag } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container, anchor);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                }
                else if (shapeFlag & ShapeFlags.COMPONENT) {
                    processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
                }
                break;
        }
    };
    const processText = (n1, n2, container, anchor) => {
        console.log(n1);
        if (n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container, anchor);
        }
    };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
        if (n1 == null) {
            if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
            }
            else {
                mountComponent(n2, container, anchor, parentComponent, parentSuspense, namespace, optimized);
            }
        }
        else {
            // 更新vnode邏輯
        }
    };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
        const compatMountInstance = false;
        const instance = compatMountInstance ||
            (initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense));
        if (!compatMountInstance) {
            setupComponent(instance, false);
        }
    };
    const unmount = () => { };
    const render = (vnode, container, namespace) => {
        if (vnode == null) {
        }
        else {
            patch(container._vnode || null, vnode, container, null, null, null, namespace);
        }
    };
    return {
        render,
        createApp: createAppAPI(render),
    };
}
