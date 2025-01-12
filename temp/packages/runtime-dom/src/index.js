import { createRenderer, } from "../../runtime-core/src/renderer.js";
import { extend, isFunction, isString } from "../../shared/src/general.js";
import { nodeOps } from "./nodeOps.js";
import { patchProps } from "./patchProp.js";
const rendererOptions = /*@__PURE__*/ extend({ patchProps }, nodeOps);
let renderer;
function ensureRenderer() {
    return (renderer ||
        (renderer = createRenderer(rendererOptions)));
}
export const createApp = (...args) => {
    const app = ensureRenderer().createApp(...args);
    const { mount } = app; //關鍵渲染DOM得方法
    /**
     * .$mount("#app")
     * @param containerOrSelector id
     */
    app.mount = (containerOrSelector) => {
        // 返回到前面的mount
        const container = normalizeContainer(containerOrSelector);
        if (!container)
            return;
        const component = app._component;
        if (!isFunction(component) && !component.render && !component.template) {
            component.template = container.innerHTML;
        }
        if (container.nodeType === 1) {
            container.textContent = "";
        }
        if (container instanceof Element) {
            container.removeAttribute("v-cloak");
            container.setAttribute("data-v-app", ""); // 標記為vue控管的html
        }
        const proxy = mount(container, false, resolveRootNamespace(container));
        return proxy;
    };
    // console.log("createApp", app);
    return app;
};
function resolveRootNamespace(container) {
    if (container instanceof SVGAElement)
        return "svg";
    if (typeof MathMLElement === "function" && container instanceof MathMLElement)
        return "mathml";
}
function normalizeContainer(container) {
    if (isString(container)) {
        const res = document.querySelector(container);
        return res;
    }
    return container;
}
export * from "../../runtime-core/src/index.js";
