import { AppContext } from "./compat/apiCreateApp.js";
import { ConcreteComponent, Data } from "./component.js";

export type PropType<T> = PropConstructor<T> | (PropConstructor<T> | null)[];
type DefaultFactory<T> = (props: Data) => T | null | undefined;

type PropConstructor<T = any> =
  | { new (...args: any[]): T & {} }
  | { (): T }
  | PropMethod<T>;

type PropMethod<T, TConstructor = any> = [T] extends [
  ((...args: any) => any) | undefined
] // if is function with args, allowing non-required functions
  ? { new (): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never;

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

enum BooleanFlags {
  shouldCast,
  shouldCastTrue,
}

type NormalizedProp = PropOptions & {
  [BooleanFlags.shouldCast]?: boolean;
  [BooleanFlags.shouldCastTrue]?: boolean;
};

export type NormalizedProps = Record<string, NormalizedProp>;
export type NormalizedPropsOptions = [NormalizedProps, string[]] | [];

export function normalizePropsOptions(
  comp: ConcreteComponent,
  appContext: AppContext,
  asMixin = false
): NormalizedPropsOptions {
  return null as any;
}
