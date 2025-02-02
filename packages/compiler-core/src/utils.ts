import { JSChildNode, NodeTypes, SimpleExpressionNode } from "./ast.js";

export const isStaticExp = (p: JSChildNode): p is SimpleExpressionNode =>
  p.type === NodeTypes.SIMPLE_EXPRESSION && p.isStatic;
