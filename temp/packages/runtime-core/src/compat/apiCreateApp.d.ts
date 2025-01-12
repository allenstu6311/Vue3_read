import { Component, ComponentInternalInstance, ConcreteComponent, Data } from "../component.js";
import { ObjectEmitsOptions } from "../componentEmits.js";
import { ComponentOptions } from "../componentOptions.js";
import { ComponentPublicInstance } from "../componentPublicInstance.js";
import { Directive } from "../directives.js";
import { ElementNamespace, RootRenderFunction } from "../renderer.js";
import { VNode } from "../vnode.js";
export interface App<HostElement = any> {
    version: string;
    config: any;
    use<Options extends unknown[]>(plugin: any, // Plugin<Options>
    ...options: Options): this;
    use<Options>(plugin: any, options: Options): this;
    mixin(mixin: ComponentOptions): this;
    component(name: string): Component | undefined;
    component<T extends Component | any>(name: string, component: T): this;
    directive<HostElement = any, Value = any, Modifiers extends string = string, Arg extends string = string>(name: string): Directive<HostElement, Value, Modifiers, Arg> | undefined;
    directive<HostElement = any, Value = any, Modifiers extends string = string, Arg extends string = string>(name: string, directive: Directive<HostElement, Value, Modifiers, Arg>): this;
    mount(rootContainer: HostElement | string, 
    /**
     * @internal
     */
    isHydrate?: boolean, 
    /**
     * @internal
     */
    namespace?: boolean | ElementNamespace, 
    /**
     * @internal
     */
    vnode?: VNode): ComponentPublicInstance;
    unmount(): void;
    onUnmount(cb: () => void): void;
    /**
     * Runs a function with the app as active instance. This allows using of `inject()` within the function to get access
     * to variables provided via `app.provide()`.
     *
     * @param fn - function to run with the app as active instance
     */
    runWithContext<T>(fn: () => T): T;
    _uid: number;
    _component: ConcreteComponent;
    _props: Data | null;
    _container: HostElement | null;
    _context: AppContext;
    _instance: ComponentInternalInstance | null;
    /**
     * @internal custom element vnode
     */
    _ceVNode?: VNode;
    /**
     * v2 compat only
     */
    filter?(name: string): Function | undefined;
    filter?(name: string, filter: Function): this;
    /**
     * @internal v3 compat only
     */
    _createRoot?(options: ComponentOptions): any;
}
/**
 * 應用上下文 (AppContext) 介面
 * 用於管理 Vue 應用程序的全局配置和狀態
 */
export interface AppContext {
    app: App;
    config: any;
    mixins: ComponentOptions[];
    components: Record<string, Component>;
    directives: Record<string, Directive>;
    provides: Record<string | symbol, any>;
    /**
     * Cache for merged/normalized component options
     * Each app instance has its own cache because app-level global mixins and
     * optionMergeStrategies can affect merge behavior.
     * @internal
     */
    optionsCache: WeakMap<ComponentOptions, any>;
    /**
     * Cache for normalized props options
     * @internal
     */
    propsCache: WeakMap<ConcreteComponent, any>;
    /**
     * Cache for normalized emits options
     * @internal
     */
    emitsCache: WeakMap<ConcreteComponent, ObjectEmitsOptions | null>;
    /**
     * HMR only
     * @internal
     */
    reload?: () => void;
    /**
     * v2 compat only
     * @internal
     */
    filters?: Record<string, Function>;
}
/**
 * 全局配置 (AppConfig) 介面
 * 用於控制應用的行為和設置
 */
export declare function createAppContext(): AppContext;
export type CreateAppFunction<HostElement> = (rootComponent: Component, rootProps?: Data | null) => App<HostElement>;
export declare function createAppAPI<HostElement>(render: RootRenderFunction<HostElement>): CreateAppFunction<HostElement>;
