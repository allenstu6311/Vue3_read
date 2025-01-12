import { ReactiveFlags } from "./constants.js";
import { isReactive, toRaw, toReactive } from "./reactive.js";
export function isRef(r) {
    return r ? r[ReactiveFlags.IS_REF] === true : false;
}
export function ref(value) {
    return createRef(value, false);
}
function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}
class RefImpl {
    // dep
    constructor(value, isShallow) {
        this._rawValue = isShallow ? value : toRaw(value);
        this._value = isShallow ? value : toReactive(value);
    }
    get value() {
        return this._value;
    }
    set value(newVal) { }
}
/**
 * 檢查傳入的值是否為 ref，，如果是則返回其內部的值（即 ref.value）
 */
export function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
const shallowUnwrapHandlers = {
    get: (target, key, receiver) => key === ReactiveFlags.RAW
        ? target
        : unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        }
        else {
            return Reflect.set(target, key, value, receiver);
        }
    },
};
export function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs)
        ? objectWithRefs
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
