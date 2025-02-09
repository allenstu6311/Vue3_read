import { RendererOptions } from "../../runtime-core/src/renderer.js";

const doc = (typeof document !== "undefined" ? document : null) as Document;
export const svgNS = "http://www.w3.org/2000/svg";
export const mathmlNS = "http://www.w3.org/1998/Math/MathML";

/**
 * baseCreateRenderer options
 */
export const nodeOps: Omit<RendererOptions<Node, Element>, "patchProp"> = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {},
  /**
   *
   * @param tag tag name
   * @param namespace
   * @param is :is
   * @param props
   */
  createElement: (tag, namespace, is, props): Element => {
    const el =
      namespace === "svg"
        ? doc.createElementNS(svgNS, tag)
        : namespace === "mathml"
        ? doc.createElementNS(mathmlNS, tag)
        : is
        ? doc.createElement(tag, { is })
        : doc.createElement(tag);

    return el;
  },
  createText: (text) => {
    return doc.createTextNode(text);
  },
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode as Element | null,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  insertStaticContent(content, parent, anchor, namespace, start, end): any {},
};
