import { ShapeFlags } from "../../shared/src/shapeFlags.js";
import { ComponentInternalInstance } from "./component.js";
import { setCurrentRenderingInstance } from "./componentRenderContext.js";
import { normalizeVNode, VNode } from "./vnode.js";

export function renderComponentRoot(
  instance: ComponentInternalInstance
): VNode {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    // propsOptions: [propsOptions], TODO propsOptions是null所以不能預設陣列
    slots,
    attrs,
    emit,
    render,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs,
  } = instance;

  const prev = setCurrentRenderingInstance(instance);

  let result;
  let fallthroughAttrs;

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    const proxyToUse = withProxy || proxy;
    const thisProxy = proxyToUse;

    // 標準化vnode
    result = normalizeVNode(
      // 呼叫渲染函數，生成VNode
      render!.call(
        thisProxy,
        proxyToUse!,
        renderCache,
        props,
        setupState,
        data,
        ctx
      )
    );

    fallthroughAttrs = attrs;
  }
  let root = result;
  result = root;

  setCurrentRenderingInstance(prev);
  return result as any;
}
