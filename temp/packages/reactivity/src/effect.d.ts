import { Link } from "./dep";
export type DebuggerEvent = {
    effect: Subscriber;
} & DebuggerEventExtraInfo;
export type DebuggerEventExtraInfo = {
    target: object;
    type: any;
    key: any;
    newValue?: any;
    oldValue?: any;
    oldTarget?: Map<any, any> | Set<any>;
};
export interface DebuggerOptions {
    onTrack?: (event: DebuggerEvent) => void;
    onTrigger?: (event: DebuggerEvent) => void;
}
/**
 * Subscriber is a type that tracks (or subscribes to) a list of deps.
 */
export interface Subscriber extends DebuggerOptions {
    /**
     * Head of the doubly linked list representing the deps
     * @internal
     */
    deps?: Link;
    /**
     * Tail of the same list
     * @internal
     */
    depsTail?: Link;
    /**
     * @internal
     */
    /**
     * @internal
     */
    next?: Subscriber;
    /**
     * returning `true` indicates it's a computed that needs to call notify
     * on its dep too
     * @internal
     */
    notify(): true | void;
}
export declare class ReactiveEffect<T = any> {
}
/**
 * @internal
 */
export declare let shouldTrack: boolean;
/**
 * 暫時停止追蹤(暫停響應式)
 */
export declare function pauseTracking(): void;
/**
 * 重置之前的全域效果追蹤狀態。
 */
export declare function resetTracking(): void;
