import { isObject, toRawType } from "../../shared/src/general.js"
import { mutableHandlers } from "./baseHandlers.js"
import { mutableCollectionHandlers } from "./collectionHandlers.js"
import { ReactiveFlags } from "./constants.js"

export interface Target {
    [ReactiveFlags.SKIP]?: boolean
    [ReactiveFlags.IS_REACTIVE]?: boolean
    [ReactiveFlags.IS_READONLY]?: boolean
    [ReactiveFlags.IS_SHALLOW]?: boolean
    [ReactiveFlags.RAW]?: any
}

export type UnwrapNestedRefs<T> = {}
declare const ReactiveMarkerSymbol: unique symbol
export interface ReactiveMarker {
    [ReactiveMarkerSymbol]?: void
}

export type Reactive<T> = UnwrapNestedRefs<T> &
    (T extends readonly any[] ? ReactiveMarker : {})

export const reactiveMap: WeakMap<Target, any> = new WeakMap<Target, any>()


enum TargetType {
    INVALID = 0,       // 無效類型，例如 null 或非對象類型
    COMMON = 1,        // 普通對象，例如 {}
    COLLECTION = 2,    // 集合類型對象，例如 Map、Set
}

function targetTypeMap(rawType: string) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return TargetType.COMMON
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION
        default:
            return TargetType.INVALID
    }
}

function getTargetType(value: Target) {
    return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
        ? TargetType.INVALID
        : targetTypeMap(toRawType(value))
}

/**
 * 返回原始對象
 */
export function toRaw<T>(observed: T): T {
    const raw = observed && (observed as Target)[ReactiveFlags.RAW];
    // 如果是代理對象，返回原始對象；否則返回本身
    return raw ? toRaw(raw) : observed
}

export function reactive<T extends object>(target: T): Reactive<T>
export function reactive(target: object) {
    return createReactiveObject(
        target,
        false,
        mutableHandlers,
        mutableCollectionHandlers,
        reactiveMap
    )
}

/**
 * 建立proxy物件
 */
function createReactiveObject(
    target: Target,
    isReadonly: boolean,
    baseHandlers: ProxyHandler<any>,
    collectionHandlers: ProxyHandler<any>,
    proxyMap: WeakMap<Target, any>,
) {
    if (!isObject(target)) return target;
    const targetType = getTargetType(target)

    const proxy = new Proxy(
        target,
        targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers,
    )
    proxyMap.set(target, proxy)
    return proxy;
}

/**
 * Returns a reactive proxy of the given value (if possible).
 *
 * If the given value is not an object, the original value itself is returned.
 *
 * @param value - The value for which a reactive proxy shall be created.
 */
export const toReactive = <T extends unknown>(value: T): T => isObject(value) ? reactive(value) as T : value;

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
export function isReactive(value: unknown): boolean {
    if (isReadonly(value)) {
        return isReactive((value as Target)[ReactiveFlags.RAW])
    }
    return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}


export function isReadonly(value: unknown): boolean {
    return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}
