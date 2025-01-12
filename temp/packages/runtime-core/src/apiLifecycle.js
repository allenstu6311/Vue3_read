import { currentInstance, isInSSRComponentSetup, } from "./component.js";
import { LifecycleHooks } from "./enums.js";
export function injectHook() { }
const createHook = (lifecycle) => (hook, target = currentInstance) => {
    // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
    if (!isInSSRComponentSetup ||
        lifecycle === LifecycleHooks.SERVER_PREFETCH) {
        //   injectHook(lifecycle, (...args: unknown[]) => hook(...args), target)
    }
};
export const onRenderTriggered = createHook(LifecycleHooks.RENDER_TRIGGERED);
export const onRenderTracked = createHook(LifecycleHooks.RENDER_TRACKED);
