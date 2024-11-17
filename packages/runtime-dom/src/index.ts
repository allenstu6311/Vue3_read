
import { createRenderer, ElementNamespace, type HydrationRenderer, type Renderer } from "../../runtime-core/src/renderer.js"
import { extend, isString } from "../../shared/src/general.js"
import { nodeOps } from "./nodeOps.js"
import { patchProps } from "./patchProp.js"

const rendererOptions = /*@__PURE__*/ extend({ patchProps }, nodeOps) as any

let renderer: Renderer<Element | ShadowRoot> | HydrationRenderer
function ensureRenderer() {
    return (
        renderer ||
        (renderer = createRenderer<Node, Element | ShadowRoot>(rendererOptions))
    )
}

export const createApp = ((...args: any) => {
    const app = (ensureRenderer().createApp as (...args: any[]) => any)(...args);

    const { mount } = app;

    /**
     * #app
     * @param containerOrSelector id
     */
    app.mount = (containerOrSelector: Element | ShadowRoot | string): any => {
        // 返回到前面的mount
        const container = normalizeContainer(containerOrSelector);
        if (container) {
            return mount(container, true,resolveRootNamespace(container))
        }
    }
    console.log('createApp', app);

    return app
})

function resolveRootNamespace(
    container: Element | ShadowRoot,
): ElementNamespace {
    if (container instanceof SVGAElement) return 'svg';
    if (typeof MathMLElement === 'function' && container instanceof MathMLElement) return 'mathml';
}

function normalizeContainer(
    container: Element | ShadowRoot | string
): Element | ShadowRoot | null {
    return container as any;
}