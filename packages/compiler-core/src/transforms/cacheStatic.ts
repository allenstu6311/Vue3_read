import {
  CacheExpression,
  ConstantTypes,
  NodeTypes,
  SimpleExpressionNode,
  TemplateChildNode,
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
