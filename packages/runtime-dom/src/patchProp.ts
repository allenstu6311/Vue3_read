import { RendererOptions } from "../../runtime-core/src/renderer.js";
import { isOn } from "../../shared/src/general.js";
import { patchClass } from "./modules/class.js";
import { patchEvent } from "./modules/events.js";

type DOMRendererOptions = RendererOptions<Node, Element>;

export const patchProp: DOMRendererOptions["patchProp"] = (
  el,
  key, // onclick, onInput...
  prevValue,
  nextValue,
  namespace,
  parentComponent
) => {
  const isSVG = namespace === "svg";

  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  }else if(isOn(key)){
    // 設置監聽事件
    patchEvent(el, key, prevValue, nextValue, parentComponent)
  }
};
