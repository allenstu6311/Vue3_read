import { pauseTracking, resetTracking } from "../../reactivity/src/effect.js";
import { EMPTY_OBJ, isFunction } from "../../shared/src/general.js";
import {
  ComponentInternalInstance,
  getComponentPublicInstance,
} from "./component.js";
import { ComponentPublicInstance } from "./componentPublicInstance.js";
import { currentRenderingInstance } from "./componentRenderContext.js";
import { callWithAsyncErrorHandling, ErrorCodes } from "./errorHandling.js";
import { VNode } from "./vnode.js";

export interface DirectiveBinding<
  Value = any,
  Modifiers extends string = string,
  Arg extends string = string
> {
  instance: ComponentPublicInstance | Record<string, any> | null;
  value: Value;
  oldValue: Value | null;
  arg?: Arg;
  modifiers: DirectiveModifiers<Modifiers>;
  dir: ObjectDirective<any, Value>;
}

export type DirectiveHook<
  HostElement = any,
  Prev = VNode<any, HostElement> | null,
  Value = any,
  Modifiers extends string = string,
  Arg extends string = string
> = (
  el: HostElement,
  binding: any,
  vnode: VNode<any, HostElement>,
  prevVNode: Prev
) => void;

export interface ObjectDirective<
  HostElement = any,
  Value = any,
  Modifiers extends string = string,
  Arg extends string = string
> {
  /**
   * @internal without this, ts-expect-error in directives.test-d.ts somehow
   * fails when running tsc, but passes in IDE and when testing against built
   * dts. Could be a TS bug.
   */
  __mod?: Modifiers;
  created?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
  beforeMount?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
  mounted?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
  beforeUpdate?: DirectiveHook<
    HostElement,
    VNode<any, HostElement>,
    Value,
    Modifiers,
    Arg
  >;
  updated?: DirectiveHook<
    HostElement,
    VNode<any, HostElement>,
    Value,
    Modifiers,
    Arg
  >;
  beforeUnmount?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
  unmounted?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
  //   getSSRProps?: SSRDirectiveHook<Value, Modifiers, Arg>
  deep?: boolean;
}

export type Directive<
  HostElement = any,
  Value = any,
  Modifiers extends string = string,
  Arg extends string = string
> = ObjectDirective<HostElement, Value, Modifiers, Arg>;
//   | FunctionDirective<HostElement, Value, Modifiers, Arg>

export type DirectiveModifiers<K extends string = string> = Record<K, boolean>;

// Directive, value, argument, modifiers
export type DirectiveArguments = Array<
  | [Directive | undefined]
  | [Directive | undefined, any]
  | [Directive | undefined, any, string]
  | [Directive | undefined, any, string | undefined, DirectiveModifiers]
>;

export function withDirectives<T extends VNode>(
  vnode: T,
  directives: DirectiveArguments
): T {
  if (currentRenderingInstance === null) return vnode;
  const instance = getComponentPublicInstance(currentRenderingInstance);
  const bindings: DirectiveBinding[] = vnode.dirs || (vnode.dirs = []);

  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];

    if (dir) {
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers,
      });
    }
  }

  return vnode;
}

export function invokeDirectiveHook(
  vnode: VNode,
  prevVNode: VNode | null,
  instance: ComponentInternalInstance | null,
  name: keyof ObjectDirective
): void {
  const bindings = vnode.dirs!;
  const oldBindings = prevVNode && prevVNode.dirs!;

  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }

    let hook = binding.dir[name] as DirectiveHook | DirectiveHook[] | undefined;
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, ErrorCodes.DIRECTIVE_HOOK, [
        vnode.el,
        binding,
        vnode,
        prevVNode,
      ]);
      resetTracking();
    }
  }
}
