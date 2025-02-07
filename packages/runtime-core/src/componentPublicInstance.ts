import { toRaw } from "../../reactivity/src/reactive.js";
import { NOOP } from "../../shared/src/general.js";
import { ComponentInternalInstance, Data } from "./component.js";
import { EmitsOptions } from "./componentEmits.js";
import {
  ComponentInjectOptions,
  ComponentOptionsBase,
  ComputedOptions,
  MethodOptions,
} from "./componentOptions.js";
import { SlotsType } from "./componentSlots.js";

export type ComponentPublicInstance<
  P = {}, // props type extracted from props option
  B = {}, // raw bindings returned from setup()
  D = {}, // return from data()
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  E extends EmitsOptions = {},
  PublicProps = {},
  Defaults = {},
  MakeDefaultsOptional extends boolean = false,
  Options = ComponentOptionsBase<any, any, any, any, any, any, any, any, any>,
  I extends ComponentInjectOptions = {},
  S extends SlotsType = {},
  Exposed extends string = "",
  TypeRefs extends Data = {},
  TypeEl extends Element = any
> = {};

export interface ComponentRenderContext {
  [key: string]: any;
  _: ComponentInternalInstance;
}

export const RuntimeCompiledPublicInstanceProxyHandlers: ProxyHandler<any> = {};

export const PublicInstanceProxyHandlers: ProxyHandler<any> = {
  // get({ _: instance }: ComponentRenderContext, key: string) {},
};

// dev only
export function exposeSetupStateOnRenderContext(
  instance: ComponentInternalInstance
): void {
  const { ctx, setupState } = instance;
  Object.keys(toRaw(setupState)).forEach((key) => {
    if (!setupState.__isScriptSetup) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => setupState[key],
        set: NOOP,
      });
    }
  });
}
