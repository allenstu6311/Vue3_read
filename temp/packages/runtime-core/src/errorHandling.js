import { LifecycleHooks } from "./enums.js";
export var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes[ErrorCodes["SETUP_FUNCTION"] = 0] = "SETUP_FUNCTION";
    ErrorCodes[ErrorCodes["RENDER_FUNCTION"] = 1] = "RENDER_FUNCTION";
    // The error codes for the watch have been transferred to the reactivity
    // package along with baseWatch to maintain code compatibility. Hence,
    // it is essential to keep these values unchanged.
    // WATCH_GETTER,
    // WATCH_CALLBACK,
    // WATCH_CLEANUP,
    ErrorCodes[ErrorCodes["NATIVE_EVENT_HANDLER"] = 5] = "NATIVE_EVENT_HANDLER";
    ErrorCodes[ErrorCodes["COMPONENT_EVENT_HANDLER"] = 6] = "COMPONENT_EVENT_HANDLER";
    ErrorCodes[ErrorCodes["VNODE_HOOK"] = 7] = "VNODE_HOOK";
    ErrorCodes[ErrorCodes["DIRECTIVE_HOOK"] = 8] = "DIRECTIVE_HOOK";
    ErrorCodes[ErrorCodes["TRANSITION_HOOK"] = 9] = "TRANSITION_HOOK";
    ErrorCodes[ErrorCodes["APP_ERROR_HANDLER"] = 10] = "APP_ERROR_HANDLER";
    ErrorCodes[ErrorCodes["APP_WARN_HANDLER"] = 11] = "APP_WARN_HANDLER";
    ErrorCodes[ErrorCodes["FUNCTION_REF"] = 12] = "FUNCTION_REF";
    ErrorCodes[ErrorCodes["ASYNC_COMPONENT_LOADER"] = 13] = "ASYNC_COMPONENT_LOADER";
    ErrorCodes[ErrorCodes["SCHEDULER"] = 14] = "SCHEDULER";
    ErrorCodes[ErrorCodes["COMPONENT_UPDATE"] = 15] = "COMPONENT_UPDATE";
    ErrorCodes[ErrorCodes["APP_UNMOUNT_CLEANUP"] = 16] = "APP_UNMOUNT_CLEANUP";
})(ErrorCodes || (ErrorCodes = {}));
export const ErrorTypeStrings = {
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
export function callWithErrorHandling(fn, instance, type, args) {
    try {
        return args ? fn(...args) : fn();
    }
    catch (err) {
        // handleError(err, instance, type);
        console.log("error", err);
    }
}
