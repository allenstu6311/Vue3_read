import { Component, ConcreteComponent, Data } from "../component.js";
import { ObjectEmitsOptions } from "../componentEmits.js";
import { ComponentOptions } from "../componentOptions.js";
import { Directive } from "../directives.js";

export interface App<HostElement = any> { }

export type CreateAppFunction<HostElement> = (
    rootComponent: Component,
    rootProps?: Data | null,
) => App<HostElement>

export interface AppContext {
    app: App // for devtools
    config: any
    mixins: ComponentOptions[]
    components: Record<string, Component>
    directives: Record<string, Directive>
    provides: Record<string | symbol, any>
  
    /**
     * Cache for merged/normalized component options
     * Each app instance has its own cache because app-level global mixins and
     * optionMergeStrategies can affect merge behavior.
     * @internal
     */
    optionsCache: WeakMap<ComponentOptions, any>
    /**
     * Cache for normalized props options
     * @internal
     */
    propsCache: WeakMap<ConcreteComponent, any>
    /**
     * Cache for normalized emits options
     * @internal
     */
    emitsCache: WeakMap<ConcreteComponent, ObjectEmitsOptions | null>
    /**
     * HMR only
     * @internal
     */
    reload?: () => void
    /**
     * v2 compat only
     * @internal
     */
    filters?: Record<string, Function>
  }