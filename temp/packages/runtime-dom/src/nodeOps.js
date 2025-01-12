const doc = (typeof document !== "undefined" ? document : null);
/**
 * baseCreateRenderer options
 */
export const nodeOps = {
    insert: (child, parent, anchor) => {
        console.log("insert");
        parent.insertBefore(child, anchor || null);
    },
    remove: (child) => { },
    createElement: (tag, namespace, is, props) => { },
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
    parentNode: (node) => node.parentNode,
    nextSibling: (node) => node.nextSibling,
    querySelector: (selector) => doc.querySelector(selector),
    setScopeId(el, id) {
        el.setAttribute(id, "");
    },
    insertStaticContent(content, parent, anchor, namespace, start, end) { },
};
