import { CreateAppFunction } from "./compat/apiCreateApp.js";
import { ComponentInternalInstance } from "./component.js";
import { createHydrationFunctions } from "./hydration.js";
import type { VNode, VNodeProps } from "./vnode.js"

/**
 * RendererNode 可以是任何物件。在核心渲染邏輯中，它不會被直接操作，
 * 而是通過配置中提供的操作函數來處理，因此只需定義為一個通用物件即可
 */
export interface RendererNode {
    [key: string | symbol]: any
}

export interface RendererElement extends RendererNode { }

export interface Renderer<HostElement = RendererElement> {
    render: RootRenderFunction<HostElement>,
    createApp: CreateAppFunction<HostElement>
}

export type ElementNamespace = 'svg' | 'mathml' | undefined

export type RootRenderFunction<HostElement = RendererElement> = (
    vnode: VNode | null,
    container: HostElement,
    namespace?: ElementNamespace
) => void;

export interface HydrationRenderer extends Renderer<Element | ShadowRoot> {}

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement,
> {
  patchProp(
    el: HostElement,
    key: string,
    prevValue: any,
    nextValue: any,
    namespace?: ElementNamespace,
    parentComponent?: ComponentInternalInstance | null,
  ): void
  insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void
  remove(el: HostNode): void
  createElement(
    type: string,
    namespace?: ElementNamespace,
    isCustomizedBuiltIn?: string,
    vnodeProps?: (VNodeProps & { [key: string]: any }) | null,
  ): HostElement
  createText(text: string): HostNode
  createComment(text: string): HostNode
  setText(node: HostNode, text: string): void
  setElementText(node: HostElement, text: string): void
  parentNode(node: HostNode): HostElement | null
  nextSibling(node: HostNode): HostNode | null
  querySelector?(selector: string): HostElement | null
  setScopeId?(el: HostElement, id: string): void
  cloneNode?(node: HostNode): HostNode
  insertStaticContent?(
    content: string,
    parent: HostElement,
    anchor: HostNode | null,
    namespace: ElementNamespace,
    start?: HostNode | null,
    end?: HostNode | null,
  ): [HostNode, HostNode]
}


export function createRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement,
>(options: RendererOptions<HostNode, HostElement>): Renderer<HostElement> {
  return baseCreateRenderer<HostNode, HostElement>(options)
}

function baseCreateRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement,
>(options: RendererOptions<HostNode, HostElement>): Renderer<HostElement>

function baseCreateRenderer(
    options:RendererOptions,
    createHydrationFns?:typeof createHydrationFunctions
):any{

}
