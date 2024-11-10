import { RendererOptions } from "../../runtime-core/src/renderer.js";

type DOMRendererOptions = RendererOptions<Node, Element>;

export const patchProps: DOMRendererOptions['patchProp'] = (
    el,
    key,
    prevValue,
    nextValue,
    namespace,
    parentComponent
) =>{
    const isSvg = namespace === 'svg';

    if(key === 'class'){
        
    }
}