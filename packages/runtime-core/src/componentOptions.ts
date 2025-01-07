import {
  ComputedGetter,
  WritableComputedOptions,
} from "../../reactivity/src/computed.js";
import { DebuggerHook } from "./apiLifecycle.js";
import {
  Component,
  ComponentInternalInstance,
  ConcreteComponent,
  Data,
} from "./component.js";
import { EmitsOptions } from "./componentEmits.js";
import { SlotsType } from "./componentSlots.js";
import { Directive } from "./directives.js";
import { VNodeChild } from "./vnode.js";

export type ComputedOptions = Record<
  string,
  ComputedGetter<any> | WritableComputedOptions<any>
>;

export type MergedComponentOptions = ComponentOptions &
  MergedComponentOptionsOverride;
type MergedHook<T = () => void> = T | T[];

export type MergedComponentOptionsOverride = {
  beforeCreate?: MergedHook;
  created?: MergedHook;
  beforeMount?: MergedHook;
  mounted?: MergedHook;
  beforeUpdate?: MergedHook;
  updated?: MergedHook;
  activated?: MergedHook;
  deactivated?: MergedHook;
  /** @deprecated use `beforeUnmount` instead */
  beforeDestroy?: MergedHook;
  beforeUnmount?: MergedHook;
  /** @deprecated use `unmounted` instead */
  destroyed?: MergedHook;
  unmounted?: MergedHook;
  renderTracked?: MergedHook<DebuggerHook>;
  renderTriggered?: MergedHook<DebuggerHook>;
  // errorCaptured?: MergedHook<ErrorCapturedHook>
};

export interface MethodOptions {
  [key: string]: Function;
}

type ObjectInjectOptions = Record<
  string | symbol,
  string | symbol | { from?: string | symbol; default?: unknown }
>;
type ObjectProvideOptions = Record<string | symbol, unknown>;

export type ComponentInjectOptions = string[] | ObjectInjectOptions;

export type ComponentProvideOptions = ObjectProvideOptions | Function;

export interface ComponentOptionsBase<
  RawBindings,
  D,
  C extends ComputedOptions,
  M extends MethodOptions,
  Mixin extends ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin,
  E extends EmitsOptions,
  EE extends string = string,
  Defaults = {},
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},
  LC extends Record<string, Component> = {},
  Directives extends Record<string, Directive> = {},
  Exposed extends string = string,
  Provide extends ComponentProvideOptions = ComponentProvideOptions
> {}

export type ComponentOptionsMixin = any;

export type ComponentOptions<
  Props = {},
  RawBindings = any,
  D = any,
  C extends ComputedOptions = any,
  M extends MethodOptions = any,
  Mixin extends ComponentOptionsMixin = any,
  Extends extends ComponentOptionsMixin = any,
  E extends EmitsOptions = any,
  EE extends string = string,
  Defaults = {},
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},
  LC extends Record<string, Component> = {},
  Directives extends Record<string, Directive> = {},
  Exposed extends string = string,
  Provide extends ComponentProvideOptions = ComponentProvideOptions
> = any;

export type RenderFunction = () => VNodeChild;
