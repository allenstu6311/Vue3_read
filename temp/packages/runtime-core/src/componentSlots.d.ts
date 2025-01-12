import { IfAny } from "../../runtime-dom/src/typeUtils.js";
import { SlotFlags } from "../../shared/src/slotFlags.js";
import { ComponentInternalInstance } from "./component.js";
import { VNode } from "./vnode.js";
declare const SlotSymbol: unique symbol;
export type Slot<T extends any = any> = (...args: IfAny<T, any[], [T] | (T extends undefined ? [] : never)>) => VNode[];
export type SlotsType<T extends Record<string, any> = Record<string, any>> = {
    [SlotSymbol]?: T;
};
export type InternalSlots = {
    [name: string]: Slot | undefined;
};
export type RawSlots = {
    [name: string]: unknown;
    $stable?: boolean;
    /**
     * for tracking slot owner instance. This is attached during
     * normalizeChildren when the component vnode is created.
     * @internal
     */
    _ctx?: ComponentInternalInstance | null;
    /**
     * indicates compiler generated slots
     * we use a reserved property instead of a vnode patchFlag because the slots
     * object may be directly passed down to a child component in a manual
     * render function, and the optimization hint need to be on the slot object
     * itself to be preserved.
     * @internal
     */
    _?: SlotFlags;
};
export {};
