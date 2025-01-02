import { ComponentInternalInstance } from "./component.js";
import { LifecycleHooks } from "./enums.js";

export enum ErrorCodes {
  SETUP_FUNCTION,
  RENDER_FUNCTION,
  // The error codes for the watch have been transferred to the reactivity
  // package along with baseWatch to maintain code compatibility. Hence,
  // it is essential to keep these values unchanged.
  // WATCH_GETTER,
  // WATCH_CALLBACK,
  // WATCH_CLEANUP,
  NATIVE_EVENT_HANDLER = 5,
  COMPONENT_EVENT_HANDLER,
  VNODE_HOOK,
  DIRECTIVE_HOOK,
  TRANSITION_HOOK,
  APP_ERROR_HANDLER,
  APP_WARN_HANDLER,
  FUNCTION_REF,
  ASYNC_COMPONENT_LOADER,
  SCHEDULER,
  COMPONENT_UPDATE,
  APP_UNMOUNT_CLEANUP,
}

export const ErrorTypeStrings: Record<ErrorTypes, string> = {
  [LifecycleHooks.SERVER_PREFETCH]: "serverPrefetch hook",
  [LifecycleHooks.BEFORE_CREATE]: "beforeCreate hook",
  [LifecycleHooks.CREATED]: "created hook",
  [LifecycleHooks.BEFORE_MOUNT]: "beforeMount hook",
  [LifecycleHooks.MOUNTED]: "mounted hook",
  [LifecycleHooks.BEFORE_UPDATE]: "beforeUpdate hook",
  [LifecycleHooks.UPDATED]: "updated",
  [LifecycleHooks.BEFORE_UNMOUNT]: "beforeUnmount hook",
  [LifecycleHooks.UNMOUNTED]: "unmounted hook",
  [LifecycleHooks.ACTIVATED]: "activated hook",
  [LifecycleHooks.DEACTIVATED]: "deactivated hook",
  [LifecycleHooks.ERROR_CAPTURED]: "errorCaptured hook",
  [LifecycleHooks.RENDER_TRACKED]: "renderTracked hook",
  [LifecycleHooks.RENDER_TRIGGERED]: "renderTriggered hook",
  [ErrorCodes.SETUP_FUNCTION]: "setup function",
  [ErrorCodes.RENDER_FUNCTION]: "render function",
  //   [WatchErrorCodes.WATCH_GETTER]: 'watcher getter',
  //   [WatchErrorCodes.WATCH_CALLBACK]: 'watcher callback',
  //   [WatchErrorCodes.WATCH_CLEANUP]: 'watcher cleanup function',
  [ErrorCodes.NATIVE_EVENT_HANDLER]: "native event handler",
  [ErrorCodes.COMPONENT_EVENT_HANDLER]: "component event handler",
  [ErrorCodes.VNODE_HOOK]: "vnode hook",
  [ErrorCodes.DIRECTIVE_HOOK]: "directive hook",
  [ErrorCodes.TRANSITION_HOOK]: "transition hook",
  [ErrorCodes.APP_ERROR_HANDLER]: "app errorHandler",
  [ErrorCodes.APP_WARN_HANDLER]: "app warnHandler",
  [ErrorCodes.FUNCTION_REF]: "ref function",
  [ErrorCodes.ASYNC_COMPONENT_LOADER]: "async component loader",
  [ErrorCodes.SCHEDULER]: "scheduler flush",
  [ErrorCodes.COMPONENT_UPDATE]: "component update",
  [ErrorCodes.APP_UNMOUNT_CLEANUP]: "app unmount cleanup function",
};

export type ErrorTypes = LifecycleHooks | ErrorCodes;

export function callWithErrorHandling(
  fn: Function,
  instance: ComponentInternalInstance | null | undefined,
  type: ErrorTypes,
  args?: unknown[]
): any {
  try {
    console.log("args", args);

    return args ? fn(...args) : fn();
  } catch (err) {
    // handleError(err, instance, type);
    console.log("error", err);
  }
}
