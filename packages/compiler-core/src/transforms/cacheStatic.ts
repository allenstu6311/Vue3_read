import {
  CacheExpression,
  ComponentNode,
  ConstantTypes,
  NodeTypes,
  PlainElementNode,
  RootNode,
  SimpleExpressionNode,
  TemplateChildNode,
  TemplateNode,
} from "../ast.js";
import { TransformContext } from "../transform.js";

export function getConstantType(
  node: TemplateChildNode | SimpleExpressionNode | CacheExpression,
  context: TransformContext
): ConstantTypes {
  const { constantCache } = context;

  switch (node.type) {
    case NodeTypes.ELEMENT:
      break;
    case NodeTypes.INTERPOLATION:
    case NodeTypes.TEXT_CALL:
      return getConstantType(node.content, context);

    default:
      return ConstantTypes.NOT_CONSTANT;
  }

  return null as any;
}

export function isSingleElementRoot(
  root: RootNode,
  child: TemplateChildNode
): child is PlainElementNode | ComponentNode | TemplateNode {
  const { children } = root;
  return (
    children.length === 1 && child.type === NodeTypes.ELEMENT
    // !isSlotOutlet(child)
  );
}
