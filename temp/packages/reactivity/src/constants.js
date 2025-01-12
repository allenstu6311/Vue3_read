export var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["SKIP"] = "__v_skip";
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
    ReactiveFlags["IS_SHALLOW"] = "__v_isShallow";
    /**
     * 是否為代理對象
     */
    ReactiveFlags["RAW"] = "__v_raw";
    ReactiveFlags["IS_REF"] = "__v_isRef";
})(ReactiveFlags || (ReactiveFlags = {}));
