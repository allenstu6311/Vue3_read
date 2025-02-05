import { JSChildNode, NodeTypes, SimpleExpressionNode } from "./ast.js";

export const isStaticExp = (p: JSChildNode): p is SimpleExpressionNode =>
  p.type === NodeTypes.SIMPLE_EXPRESSION && p.isStatic;

const nonIdentifierRE = /^\d|[^\$\w\xA0-\uFFFF]/;
/**
 * 驗證命名是否正確，例:不能以數字開頭
 */
export const isSimpleIdentifier = (name: string): boolean =>
  !nonIdentifierRE.test(name);
