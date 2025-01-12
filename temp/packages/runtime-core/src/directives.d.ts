import { VNode } from "./vnode.js";
export type DirectiveHook<HostElement = any, Prev = VNode<any, HostElement> | null, Value = any, Modifiers extends string = string, Arg extends string = string> = (el: HostElement, binding: any, vnode: VNode<any, HostElement>, prevVNode: Prev) => void;
export interface ObjectDirective<HostElement = any, Value = any, Modifiers extends string = string, Arg extends string = string> {
    /**
     * @internal without this, ts-expect-error in directives.test-d.ts somehow
     * fails when running tsc, but passes in IDE and when testing against built
     * dts. Could be a TS bug.
     */
    __mod?: Modifiers;
    created?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    beforeMount?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    mounted?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    beforeUpdate?: DirectiveHook<HostElement, VNode<any, HostElement>, Value, Modifiers, Arg>;
    updated?: DirectiveHook<HostElement, VNode<any, HostElement>, Value, Modifiers, Arg>;
    beforeUnmount?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    unmounted?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    deep?: boolean;
}
export type Directive<HostElement = any, Value = any, Modifiers extends string = string, Arg extends string = string> = ObjectDirective<HostElement, Value, Modifiers, Arg>;
