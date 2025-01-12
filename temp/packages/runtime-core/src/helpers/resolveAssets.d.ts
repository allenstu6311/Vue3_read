/**
 * 用於標識「空的動態組件」的符號。
 * 使用 Symbol.for() 確保它在全局範圍內是唯一且可共享的。
 * 當渲染動態組件時，如果檢測到該符號，可以跳過渲染。
 */
export declare const NULL_DYNAMIC_COMPONENT: unique symbol;
