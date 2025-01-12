import { ReactiveEffect } from "../../reactivity/src/effect.js";
import { EffectScope } from "../../reactivity/src/effectScope.js";
import { AppContext } from "./compat/apiCreateApp.js";
import { EmitFn, EmitsOptions, ObjectEmitsOptions } from "./componentEmits.js";
import { ComponentOptions, ComputedOptions, MethodOptions } from "./componentOptions.js";
import { NormalizedPropsOptions } from "./componentProps.js";
import { ComponentPublicInstance } from "./componentPublicInstance.js";
import { SuspenseBoundary } from "./components/Suspense.js";
import { InternalSlots } from "./componentSlots.js";
import { Directive } from "./directives.js";
import { LifecycleHooks } from "./enums.js";
import { SchedulerJob } from "./scheduler.js";
import { VNode, VNodeChild } from "./vnode.js";
export declare let currentInstance: ComponentInternalInstance | null;
export declare let isInSSRComponentSetup: boolean;
export type Component = {};
export type Data = Record<string, unknown>;
export interface FunctionalComponent<P = {}, E extends EmitsOptions | Record<string, any[]> = {}, S extends Record<string, any> = any> {
}
export type ConcreteComponent<Props = {}, RawBindings = any, D = any, C extends ComputedOptions = ComputedOptions, M extends MethodOptions = MethodOptions, E extends EmitsOptions | Record<string, any[]> = {}, S extends Record<string, any> = any> = ComponentOptions<Props, RawBindings, D, C, M> | FunctionalComponent<Props, E, S>;
export type LifecycleHook<TFn = Function> = TFn[] | null;
export type InternalRenderFunction = {
    (ctx: ComponentPublicInstance, cache: ComponentInternalInstance["renderCache"], $props: ComponentInternalInstance["props"], $setup: ComponentInternalInstance["setupState"], $data: ComponentInternalInstance["data"], $options: ComponentInternalInstance["ctx"]): VNodeChild;
    _rc?: boolean;
};
export type SetupContext = {};
/**
 * 組件實例
 */
export interface ComponentInternalInstance {
    uid: number;
    type: ConcreteComponent;
    parent: ComponentInternalInstance | null;
    root: ComponentInternalInstance;
    appContext: AppContext;
    /**
     * Vnode representing this component in its parent's vdom tree
     */
    vnode: VNode;
    /**
     * The pending new vnode from parent updates
     * @internal
     */
    next: VNode | null;
    /**
     * Root vnode of this component's own vdom tree
     */
    subTree: VNode;
    /**
     * Render effect instance
     */
    effect: ReactiveEffect;
    /**
     * Force update render effect
     */
    update: () => void;
    /**
     * Render effect job to be passed to scheduler (checks if dirty)
     */
    job: SchedulerJob;
    /**
     * The render function that returns vdom tree.
     * @internal
     */
    render: InternalRenderFunction | null;
    /**
     * SSR render function
     * @internal
     */
    ssrRender?: Function | null;
    /**
     * Object containing values this component provides for its descendants
     * @internal
     */
    provides: Data;
    /**
     * for tracking useId()
     * first element is the current boundary prefix
     * second number is the index of the useId call within that boundary
     * @internal
     */
    ids: [string, number, number];
    /**
     * Tracking reactive effects (e.g. watchers) associated with this component
     * so that they can be automatically stopped on component unmount
     * @internal
     */
    scope: EffectScope;
    /**
     * cache for proxy access type to avoid hasOwnProperty calls
     * @internal
     */
    accessCache: Data | null;
    /**
     * cache for render function values that rely on _ctx but won't need updates
     * after initialized (e.g. inline handlers)
     * @internal
     */
    renderCache: (Function | VNode | undefined)[];
    /**
     * Resolved component registry, only for components with mixins or extends
     * @internal
     */
    components: Record<string, ConcreteComponent> | null;
    /**
     * Resolved directive registry, only for components with mixins or extends
     * @internal
     */
    directives: Record<string, Directive> | null;
    /**
     * Resolved filters registry, v2 compat only
     * @internal
     */
    filters?: Record<string, Function>;
    /**
     * resolved props options
     * @internal
     */
    propsOptions: NormalizedPropsOptions;
    /**
     * resolved emits options
     * @internal
     */
    emitsOptions: ObjectEmitsOptions | null;
    /**
     * resolved inheritAttrs options
     * @internal
     */
    inheritAttrs?: boolean;
    /**
     * Custom Element instance (if component is created by defineCustomElement)
     * @internal
     */
    /**
     * is custom element? (kept only for compatibility)
     * @internal
     */
    isCE?: boolean;
    /**
     * custom element specific HMR method
     * @internal
     */
    ceReload?: (newStyles?: string[]) => void;
    proxy: ComponentPublicInstance | null;
    exposed: Record<string, any> | null;
    exposeProxy: Record<string, any> | null;
    /**
     * alternative proxy used only for runtime-compiled render functions using
     * `with` block
     * @internal
     */
    withProxy: ComponentPublicInstance | null;
    /**
     * This is the target for the public instance proxy. It also holds properties
     * injected by user options (computed, methods etc.) and user-attached
     * custom properties (via `this.x = ...`)
     * @internal
     */
    ctx: Data;
    data: Data;
    props: Data;
    attrs: Data;
    slots: InternalSlots;
    refs: Data;
    emit: EmitFn;
    /**
     * used for keeping track of .once event handlers on components
     * @internal
     */
    emitted: Record<string, boolean> | null;
    /**
     * used for caching the value returned from props default factory functions to
     * avoid unnecessary watcher trigger
     * @internal
     */
    propsDefaults: Data;
    /**
     * setup related
     * @internal
     */
    setupState: Data;
    /**
     * devtools access to additional info
     * @internal
     */
    devtoolsRawSetupState?: any;
    /**
     * @internal
     */
    setupContext: SetupContext | null;
    /**
     * suspense related
     * @internal
     */
    suspense: SuspenseBoundary | null;
    /**
     * suspense pending batch id
     * @internal
     */
    suspenseId: number;
    /**
     * @internal
     */
    asyncDep: Promise<any> | null;
    /**
     * @internal
     */
    asyncResolved: boolean;
    isMounted: boolean;
    isUnmounted: boolean;
    isDeactivated: boolean;
    /**
     * @internal
     */
    [LifecycleHooks.BEFORE_CREATE]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.CREATED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.BEFORE_MOUNT]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.MOUNTED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.BEFORE_UPDATE]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.UPDATED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.BEFORE_UNMOUNT]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.UNMOUNTED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.RENDER_TRACKED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.RENDER_TRIGGERED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.ACTIVATED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.DEACTIVATED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.ERROR_CAPTURED]: LifecycleHook;
    /**
     * @internal
     */
    [LifecycleHooks.SERVER_PREFETCH]: LifecycleHook<() => Promise<unknown>>;
    /**
     * For caching bound $forceUpdate on public proxy access
     * @internal
     */
    f?: () => void;
    /**
     * For caching bound $nextTick on public proxy access
     * @internal
     */
    n?: () => Promise<void>;
    /**
     * `updateTeleportCssVars`
     * For updating css vars on contained teleports
     * @internal
     */
    ut?: (vars?: Record<string, string>) => void;
    /**
     * dev only. For style v-bind hydration mismatch checks
     * @internal
     */
    getCssVars?: () => Record<string, string>;
}
export interface ClassComponent {
    new (...args: any[]): ComponentPublicInstance<any, any, any, any, any>;
    __vccOpts: ComponentOptions;
}
/**
 * 註冊運行時編譯器（Runtime Compiler）。
 * @param _compile 編譯模板的關鍵函數
 */
export declare function registerRuntimeCompiler(_compile: any): void;
export declare function createComponentInstance(vnode: VNode, parent: ComponentInternalInstance | null, suspense: SuspenseBoundary | null): ComponentInternalInstance;
/**
 * 是否唯有狀態的組件
 */
export declare function isStatefulComponent(instance: ComponentInternalInstance): number;
export declare function setupComponent(instance: ComponentInternalInstance, isSSR?: boolean, optimized?: boolean): Promise<void> | undefined;
export declare function handleSetupResult(instance: ComponentInternalInstance, setupResult: unknown, isSSR: boolean): void;
export declare function finishComponentSetup(instance: ComponentInternalInstance, isSSR: boolean, skipOptions?: boolean): void;
