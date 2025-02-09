import { RendererOptions } from "../../runtime-core/src/renderer.js";
import { patchClass } from "./modules/class.js";

type DOMRendererOptions = RendererOptions<Node, Element>;

export const patchProp: DOMRendererOptions["patchProp"] = (
  el,
  key,
  prevValue,
  nextValue,
  namespace,
  parentComponent
) => {
  const isSVG = namespace === "svg";

  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  }
};
