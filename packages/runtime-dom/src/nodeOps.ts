import { RendererOptions } from "../../runtime-core/src/renderer.js";

const doc = (typeof document !== "undefined" ? document : null) as Document;

/**
 * baseCreateRenderer options
 */
export const nodeOps: Omit<RendererOptions<Node, Element>, "patchProp"> = {
  insert: (child, parent, anchor) => {
    console.log("insert");

    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {},
  createElement: (tag, namespace, is, props): any => {},
  createText: (text) => {
    console.log("text", text);

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
