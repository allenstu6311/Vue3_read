import { AppContext } from "./compat/apiCreateApp.js";
import { ConcreteComponent, Data } from "./component.js";
export type PropType<T> = PropConstructor<T> | (PropConstructor<T> | null)[];
type DefaultFactory<T> = (props: Data) => T | null | undefined;
type PropConstructor<T = any> = {
    new (...args: any[]): T & {};
} | {
    (): T;
} | PropMethod<T>;
type PropMethod<T, TConstructor = any> = [T] extends [
    ((...args: any) => any) | undefined
] ? {
    new (): TConstructor;
    (): T;
    readonly prototype: TConstructor;
} : never;
export interface PropOptions<T = any, D = T> {
    type?: PropType<T> | true | null;
    required?: boolean;
    default?: D | DefaultFactory<D> | null | undefined | object;
    validator?(value: unknown, props: Data): boolean;
    /**
     * @internal
     */
    skipCheck?: boolean;
    /**
     * @internal
     */
    skipFactory?: boolean;
}
declare enum BooleanFlags {
    shouldCast = 0,
    shouldCastTrue = 1
}
type NormalizedProp = PropOptions & {
    [BooleanFlags.shouldCast]?: boolean;
    [BooleanFlags.shouldCastTrue]?: boolean;
};
export type NormalizedProps = Record<string, NormalizedProp>;
export type NormalizedPropsOptions = [NormalizedProps, string[]] | [];
export declare function normalizePropsOptions(comp: ConcreteComponent, appContext: AppContext, asMixin?: boolean): NormalizedPropsOptions;
export {};
