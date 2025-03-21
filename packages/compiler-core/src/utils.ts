import {
  DirectiveNode,
  ElementNode,
  JSChildNode,
  NodeTypes,
  SimpleExpressionNode,
} from "./ast.js";

/**
 * :class="className" || class="className"
 */
export const isStaticExp = (p: JSChildNode): p is SimpleExpressionNode =>
  p.type === NodeTypes.SIMPLE_EXPRESSION && p.isStatic;

const nonIdentifierRE = /^\d|[^\$\w\xA0-\uFFFF]/;
/**
 * 驗證命名是否正確，例:不能以數字開頭
 */
export const isSimpleIdentifier = (name: string): boolean =>
  !nonIdentifierRE.test(name);

export function isVSlot(p: ElementNode["props"][0]): p is DirectiveNode {
  return p.type === NodeTypes.DIRECTIVE && p.name === "slot";
}

export const forAliasRE: RegExp = /([\s\S]*?)\s+(?:in|of)\s+(\S[\s\S]*)/;
