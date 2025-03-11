import {
  extend,
  isFunction,
  isObject,
  NO,
} from "../../../shared/src/general.js";
import {
  Component,
  ComponentInternalInstance,
  ConcreteComponent,
  Data,
  getComponentPublicInstance,
} from "../component.js";
import { ObjectEmitsOptions } from "../componentEmits.js";
import { ComponentOptions } from "../componentOptions.js";
import { ComponentPublicInstance } from "../componentPublicInstance.js";
import { Directive } from "../directives.js";
import { ElementNamespace, RootRenderFunction } from "../renderer.js";
import { createVNode, VNode } from "../vnode.js";

export interface App<HostElement = any> {
  version: string;
  config: any; //AppConfig

  use<Options extends unknown[]>(
    plugin: any, // Plugin<Options>
    ...options: Options
  ): this;
  use<Options>(plugin: any, options: Options): this;

  mixin(mixin: ComponentOptions): this;
  component(name: string): Component | undefined;
  component<T extends Component | any>(name: string, component: T): this;
  directive<
    HostElement = any,
    Value = any,
    Modifiers extends string = string,
    Arg extends string = string
  >(
    name: string
  ): Directive<HostElement, Value, Modifiers, Arg> | undefined;
  directive<
    HostElement = any,
    Value = any,
    Modifiers extends string = string,
    Arg extends string = string
  >(
    name: string,
    directive: Directive<HostElement, Value, Modifiers, Arg>
  ): this;
  mount(
    rootContainer: HostElement | string,
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
    vnode?: VNode
  ): ComponentPublicInstance;
  unmount(): void;
  onUnmount(cb: () => void): void;
  // provide<T, K = InjectionKek<T> | string | number>(
  //   key: K,
  //   value: K extends InjectionKey<infer V> ? V : T,
  // ): this

  /**
   * Runs a function with the app as active instance. This allows using of `inject()` within the function to get access
   * to variables provided via `app.provide()`.
   *
   * @param fn - function to run with the app as active instance
   */
  runWithContext<T>(fn: () => T): T;

  // internal, but we need to expose these for the server-renderer and devtools
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
  app: App; // for devtools
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
 */
export function createAppContext(): AppContext {
  return {
    app: null as any,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: undefined,
      warnHandler: undefined,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  };
}

export type CreateAppFunction<HostElement> = (
  rootComponent: Component,
  rootProps?: Data | null
) => App<HostElement>;

let uid = 0;

export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>
  // hydrate?:
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }

    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }

    const context = createAppContext();
    const installedPlugins = new WeakMap();
    const pluginCleanupFns: Array<() => any> = [];

    let isMounted = false;

    const app: App = (context.app = {
      _uid: uid++,
      _component: rootComponent as ConcreteComponent,

      mount(
        rootContainer: HostElement,
        isHydrate?: boolean,
        namespace?: boolean | ElementNamespace
      ): any {
        console.log("mount");

        if (!isMounted) {
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;

          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = undefined;
          }
          render(vnode, rootContainer, namespace); // vnode == null ? unmount : patch

          isMounted = true;
          app._container = rootContainer;
          return getComponentPublicInstance(vnode.component!);
          // console.log("vnode", vnode);
        }
      },
    } as App) as any;

    return app;
  };
}
