import { isObject, toRawType } from "../../shared/src/general.js";
import { mutableHandlers } from "./baseHandlers.js";
import { mutableCollectionHandlers } from "./collectionHandlers.js";
import { ReactiveFlags } from "./constants.js";
export const reactiveMap = new WeakMap();
var TargetType;
(function (TargetType) {
    TargetType[TargetType["INVALID"] = 0] = "INVALID";
    TargetType[TargetType["COMMON"] = 1] = "COMMON";
    TargetType[TargetType["COLLECTION"] = 2] = "COLLECTION";
})(TargetType || (TargetType = {}));
function targetTypeMap(rawType) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return TargetType.COMMON;
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION;
        default:
            return TargetType.INVALID;
    }
}
function getTargetType(value) {
    return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
        ? TargetType.INVALID
        : targetTypeMap(toRawType(value));
}
/**
 * 返回原始對象
 */
export function toRaw(observed) {
    const raw = observed && observed[ReactiveFlags.RAW];
    // 如果是代理對象，返回原始對象；否則返回本身
    return raw ? toRaw(raw) : observed;
}
export function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
/**
 * 建立proxy物件
 */
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target))
        return target;
    const targetType = getTargetType(target);
    const proxy = new Proxy(target, targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
/**
 * Returns a reactive proxy of the given value (if possible).
 *
 * If the given value is not an object, the original value itself is returned.
 *
 * @param value - The value for which a reactive proxy shall be created.
 */
export const toReactive = (value) => isObject(value) ? reactive(value) : value;
/**
 * 判断一个对象是否是通过 reactive 或 shallowReactive 创建的响应式对
 *
 * isReactive(reactive({}))            // => true
 * isReactive(readonly(reactive({})))  // => true
 * isReactive(ref({}).value)           // => true
 * isReactive(readonly(ref({})).value) // => true
 * isReactive(ref(true))               // => false
 * isReactive(shallowRef({}).value)    // => false
 * isReactive(shallowReactive({}))     // => true
 */
export function isReactive(value) {
    if (isReadonly(value)) {
        return isReactive(value[ReactiveFlags.RAW]);
    }
    return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}
export function isReadonly(value) {
    return !!(value && value[ReactiveFlags.IS_READONLY]);
}
