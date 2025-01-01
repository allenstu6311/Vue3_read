import { UnionToIntersection } from "../../runtime-dom/src/typeUtils.js";
import { AppContext } from "./compat/apiCreateApp.js";
import { ConcreteComponent } from "./component.js";

export type ObjectEmitsOptions = Record<
  string,
  ((...args: any[]) => any) | null
>;

export type EmitsOptions = ObjectEmitsOptions | string[];

export function normalizeEmitsOptions(
  comp: ConcreteComponent,
  appContext: AppContext,
  asMixin = false
): ObjectEmitsOptions | null {
  return null;
}

export type EmitFn<
  Options = ObjectEmitsOptions,
  Event extends keyof Options = keyof Options
> = Options extends Array<infer V>
  ? (event: V, ...args: any[]) => void
  : {} extends Options // if the emit is empty object (usually the default value for emit) should be converted to function
  ? (event: string, ...args: any[]) => void
  : UnionToIntersection<
      {
        [key in Event]: Options[key] extends (...args: infer Args) => any
          ? (event: key, ...args: Args) => void
          : Options[key] extends any[]
          ? (event: key, ...args: Options[key]) => void
          : (event: key, ...args: any[]) => void;
      }[Event]
    >;
