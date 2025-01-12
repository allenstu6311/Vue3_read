export declare enum CompilerDeprecationTypes {
    COMPILER_IS_ON_ELEMENT = "COMPILER_IS_ON_ELEMENT",
    COMPILER_V_BIND_SYNC = "COMPILER_V_BIND_SYNC",
    COMPILER_V_BIND_OBJECT_ORDER = "COMPILER_V_BIND_OBJECT_ORDER",
    COMPILER_V_ON_NATIVE = "COMPILER_V_ON_NATIVE",
    COMPILER_V_IF_V_FOR_PRECEDENCE = "COMPILER_V_IF_V_FOR_PRECEDENCE",
    COMPILER_NATIVE_TEMPLATE = "COMPILER_NATIVE_TEMPLATE",
    COMPILER_INLINE_TEMPLATE = "COMPILER_INLINE_TEMPLATE",
    COMPILER_FILTERS = "COMPILER_FILTERS"
}
export type CompilerCompatConfig = Partial<Record<CompilerDeprecationTypes, boolean | "suppress-warning">> & {
    MODE?: 2 | 3;
};
export interface CompilerCompatOptions {
    compatConfig?: CompilerCompatConfig;
}
