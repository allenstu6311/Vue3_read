import { DirectiveNode, ElementNode, ForNode } from "../ast.js";
import {
  createStructuralDirectiveTransform,
  NodeTransform,
  TransformContext,
} from "../transform.js";

export const transformFor: NodeTransform = createStructuralDirectiveTransform(
  "for",
  (node, dir, context) => {
    const { helper, removeHelper } = context;
    return processFor(node, dir, context, (forNode) => {
      return null as any;
    });
  }
);

export function processFor(
  node: ElementNode,
  dir: DirectiveNode,
  context: TransformContext,
  processCodegen?: (forNode: ForNode) => (() => void) | undefined
) {
  // 沒有指令
  if (!dir.exp) return;

  const parseResult = dir.forParseResult;
  console.log("parseResult", parseResult);
  // 看到這裡
}
