import { isString } from "../../shared/src/general.js";
import {
  DirectiveNode,
  ElementNode,
  ElementTypes,
  JSChildNode,
  NodeTypes,
  RootNode,
  SimpleExpressionNode,
  TemplateChildNode,
  TemplateNode,
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

export function isTemplateNode(
  node: RootNode | TemplateChildNode
): node is TemplateNode {
  return (
    node.type === NodeTypes.ELEMENT && node.tagType === ElementTypes.TEMPLATE
  );
}

export function findDir(
  node: ElementNode,
  name: string | RegExp,
  allowEmpty: boolean = false
): DirectiveNode | undefined {
  for (let i = 0; i < node.props.length; i++) {
    const p = node.props[i];
    if (
      p.type === NodeTypes.DIRECTIVE &&
      (allowEmpty || p.exp) &&
      (isString(name) ? p.name === name : name.test(p.name))
    ) {
      return p;
    }
  }
}

/**
 * 在 AST 的 ElementNode的props 中搜尋指定名稱的屬性
 */
export function findProp(
  node: ElementNode,
  name: string,
  dynamicOnly: boolean = false,
  allowEmpty: boolean = false
): ElementNode["props"][0] | undefined {
  for (let i = 0; i < node.props.length; i++) {
    const p = node.props[i];
    if (p.type === NodeTypes.ATTRIBUTE) {
      if (dynamicOnly) continue;
      if (p.name === name && (p.value || allowEmpty)) {
        return p;
      }
    } else if (
      p.name === "bind" &&
      (p.exp || allowEmpty) &&
      isStaticArgOf(p.arg, name)
    ) {
      return p;
    }
  }
}

export function isStaticArgOf(
  arg: DirectiveNode["arg"],
  name: string
): boolean {
  return !!(arg && isStaticExp(arg) && arg.content === name);
}
