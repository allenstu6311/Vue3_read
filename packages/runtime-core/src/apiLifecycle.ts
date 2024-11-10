import { DebuggerEvent } from "../../reactivity/effect.js"
import { ComponentInternalInstance, currentInstance, isInSSRComponentSetup } from "./component.js"
import { LifecycleHooks } from "./enums.js"

export function injectHook(){}


const createHook =
  <T extends Function = () => any>(lifecycle: LifecycleHooks) =>
  (
    hook: T,
    target: ComponentInternalInstance | null = currentInstance,
  ): void => {
    // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
    if (
      !isInSSRComponentSetup ||
      lifecycle === LifecycleHooks.SERVER_PREFETCH
    ) {
    //   injectHook(lifecycle, (...args: unknown[]) => hook(...args), target)
    }
  }
type CreateHook<T = any> = (
  hook: T,
  target?: ComponentInternalInstance | null,
) => void

export type DebuggerHook = (e: DebuggerEvent) => void
export const onRenderTriggered: CreateHook<DebuggerHook> =
  createHook<DebuggerHook>(LifecycleHooks.RENDER_TRIGGERED)
export const onRenderTracked: CreateHook<DebuggerHook> =
  createHook<DebuggerHook>(LifecycleHooks.RENDER_TRACKED)