export var LifecycleHooks;
(function (LifecycleHooks) {
    LifecycleHooks["BEFORE_CREATE"] = "bc";
    LifecycleHooks["CREATED"] = "c";
    LifecycleHooks["BEFORE_MOUNT"] = "bm";
    LifecycleHooks["MOUNTED"] = "m";
    LifecycleHooks["BEFORE_UPDATE"] = "bu";
    LifecycleHooks["UPDATED"] = "u";
    LifecycleHooks["BEFORE_UNMOUNT"] = "bum";
    LifecycleHooks["UNMOUNTED"] = "um";
    LifecycleHooks["DEACTIVATED"] = "da";
    LifecycleHooks["ACTIVATED"] = "a";
    LifecycleHooks["RENDER_TRIGGERED"] = "rtg";
    LifecycleHooks["RENDER_TRACKED"] = "rtc";
    LifecycleHooks["ERROR_CAPTURED"] = "ec";
    LifecycleHooks["SERVER_PREFETCH"] = "sp";
})(LifecycleHooks || (LifecycleHooks = {}));
