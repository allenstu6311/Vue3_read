import { PatchFlags } from "../../../shared/src/patchFlags.js";
import {
  ConstantTypes,
  createVNodeCall,
  ElementTypes,
  ExpressionNode,
  NodeTypes,
  TemplateTextChildNode,
  VNodeCall,
} from "../ast.js";
import { TELEPORT } from "../runtimeHelpers.js";
import { NodeTransform } from "../transform.js";
import { getConstantType } from "./cacheStatic.js";

export const transformElement: NodeTransform = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode!;

    if (
      !(
        node.type === NodeTypes.ELEMENT &&
        (node.tagType === ElementTypes.ELEMENT ||
          node.tagType === ElementTypes.COMPONENT)
      )
    ) {
      return;
    }

    const { tag, props } = node;
    const isComponent = node.tagType === ElementTypes.COMPONENT;

    let vnodeTag = `"${tag}"` as any;
    const isDynamicComponent = false;

    let vnodeProps: VNodeCall["props"];
    let vnodeChildren: VNodeCall["children"];
    let patchFlag: VNodeCall["patchFlag"] | 0 = 0;
    let vnodeDynamicProps: VNodeCall["dynamicProps"];
    let dynamicPropNames: string[] | undefined;
    let vnodeDirectives: VNodeCall["directives"];

    let shouldUseBlock = false;

    // children
    if (node.children.length > 0) {
      const shouldBuildAsSlots = false;

      if (shouldBuildAsSlots) {
      } else if (node.children.length === 1 && vnodeTag !== TELEPORT) {
        const child = node.children[0];
        const type = child.type;

        const hasDynamicTextChild = type === NodeTypes.INTERPOLATION;

        if (
          hasDynamicTextChild &&
          getConstantType(child, context) === ConstantTypes.NOT_CONSTANT
        ) {
          patchFlag |= PatchFlags.TEXT;
        }

        if (hasDynamicTextChild || type === NodeTypes.TEXT) {
          vnodeChildren = child as TemplateTextChildNode;
        }
      }
    }

    node.codegenNode = createVNodeCall(
      context,
      vnodeTag,
      vnodeProps,
      vnodeChildren,
      patchFlag === 0 ? undefined : patchFlag,
      vnodeDynamicProps,
      vnodeDirectives,
      !!shouldUseBlock,
      false /* disableTracking */,
      isComponent,
      node.loc
    );
  };
};

export type PropsExpression = ExpressionNode;
