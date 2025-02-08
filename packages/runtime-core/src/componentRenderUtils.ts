import { ShapeFlags } from "../../shared/src/shapeFlags.js";
import { ComponentInternalInstance } from "./component.js";
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

  let result;
  let fallthroughAttrs;

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    const proxyToUse = withProxy || proxy;
    const thisProxy = proxyToUse;
    // console.log("proxyToUse", proxyToUse);
    // console.log(
    //   "dom",
    //   render!.call(
    //     thisProxy,
    //     proxyToUse!,
    //     renderCache,
    //     props,
    //     setupState,
    //     data,
    //     ctx
    //   )
    // );

    // debugger;
    result = normalizeVNode(
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

  return result as any;
}
