
import { createRenderer, type HydrationRenderer, type Renderer } from "../../runtime-core/src/renderer.js"
import { extend } from "../../shared/general.js"
import { nodeOps } from "./nodeOps.js"
import { patchProps } from "./patchProp.js"

const rendererOptions = /*@__PURE__*/ extend({ patchProps }, nodeOps)

let renderer: Renderer<Element | ShadowRoot> | HydrationRenderer
// function ensureRenderer(){
//     return (
//         renderer ||
//         (render = createRenderer<Node, Element | ShadowRoot>(rendererOptions))

//     )
// }

export const createApp = ((...args: any) => {
})