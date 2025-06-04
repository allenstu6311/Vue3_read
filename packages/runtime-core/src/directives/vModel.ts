import { ObjectDirective } from "../directives.js";

const assignKey: unique symbol = Symbol("_assign");

type AssignerFn = (value: any) => void;

type ModelDirective<T, Modifiers extends string = string> = ObjectDirective<
  T & { [assignKey]: AssignerFn; _assigning?: boolean },
  any,
  Modifiers
>;

export const vModelText: ModelDirective<
  HTMLInputElement | HTMLTextAreaElement,
  "trim" | "number" | "lazy"
> = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    console.log("created");
  },
  mounted(el, { value }) {
    console.log("mounted");

    el.value = value == null ? "" : value;
  },
  beforeUpdate(
    el,
    { value, oldValue, modifiers: { lazy, trim, number } },
    vnode
  ) {
    console.log("beforeUpdate");
  },
};
