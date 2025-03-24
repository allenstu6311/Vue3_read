import { PatchFlags } from "../../../shared/src/patchFlags.js";
import {
  BlockCodegenNode,
  ConstantTypes,
  createCallExpression,
  createFunctionExpression,
  createObjectProperty,
  createSimpleExpression,
  createVNodeCall,
  DirectiveNode,
  ElementNode,
  ExpressionNode,
  ForCodegenNode,
  ForIteratorExpression,
  ForNode,
  ForParseResult,
  ForRenderListExpression,
  getVNodeBlockHelper,
  getVNodeHelper,
  NodeTypes,
  PlainElementNode,
  VNodeCall,
} from "../ast.js";
import { FRAGMENT, OPEN_BLOCK, RENDER_LIST } from "../runtimeHelpers.js";
import {
  createStructuralDirectiveTransform,
  NodeTransform,
  TransformContext,
} from "../transform.js";
import { findProp, isTemplateNode } from "../utils.js";

export const transformFor: NodeTransform = createStructuralDirectiveTransform(
  "for",
  (node, dir, context) => {
    const { helper, removeHelper } = context;
    return processFor(node, dir, context, (forNode) => {
      // 加入v-for渲染函數代碼
      const renderExp = createCallExpression(helper(RENDER_LIST), [
        forNode.source,
      ]) as ForRenderListExpression;
      const isTemplate = isTemplateNode(node);
      const memo = undefined;
      const keyProp = findProp(node, `key`, false, true);

      const keyExp =
        keyProp &&
        (keyProp.type === NodeTypes.ATTRIBUTE //是否為靜態屬性
          ? keyProp.value
            ? createSimpleExpression(keyProp.value.content, true)
            : undefined
          : keyProp.exp);

      const keyProperty =
        keyProp && keyExp ? createObjectProperty(`key`, keyExp) : null;
      // 判斷 v-for 的來源是否是穩定的常量（例如：[1,2,3] 這種寫死的陣列）
      const isStableFragment =
        forNode.source.type === NodeTypes.SIMPLE_EXPRESSION &&
        forNode.source.constType > ConstantTypes.NOT_CONSTANT;

      // 根據是否穩定或有 key，決定要使用的 PatchFlag
      const fragmentFlag = isStableFragment
        ? PatchFlags.STABLE_FRAGMENT // 穩定內容，不需要比較每一項
        : keyProp
        ? PatchFlags.KEYED_FRAGMENT // 有提供 :key，進行 key-based diff
        : PatchFlags.UNKEYED_FRAGMENT; // 無 key，使用 index-based diff（效能較差）

      forNode.codegenNode = createVNodeCall(
        context,
        helper(FRAGMENT),
        undefined,
        renderExp,
        fragmentFlag,
        undefined,
        undefined,
        true /* isBlock */,
        !isStableFragment /* disableTracking */,
        false /* isComponent */,
        node.loc
      ) as ForCodegenNode;

      return (): void => {
        let childBlock: BlockCodegenNode;
        const { children } = forNode;

        const needFragmentWrapper = false;
        const slotOulet = false;

        if (slotOulet) {
        } else if (needFragmentWrapper) {
        } else {
          // 一般v-for
          childBlock = (children[0] as PlainElementNode)
            .codegenNode as VNodeCall;

          console.log("children", children);

          if (childBlock.isBlock) {
            helper(OPEN_BLOCK);
            helper(getVNodeBlockHelper(context.inSSR, childBlock.isComponent));
          } else {
            helper(getVNodeHelper(context.inSSR, childBlock.isComponent));
          }

          if (memo) {
            //v-memo
          } else {
            renderExp.arguments.push(
              createFunctionExpression(
                createForLoopParams(forNode.parseResult),
                childBlock,
                true /* force newline */
              ) as ForIteratorExpression
            );
          }
        }
      };
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
  if (!parseResult) return;

  finalizeForParseResult(parseResult, context);
  const { addIdentifiers, removeIdentifiers, scopes } = context;
  const { source, value, key, index } = parseResult;

  const forNode: ForNode = {
    type: NodeTypes.FOR,
    loc: dir.loc,
    source,
    valueAlias: value,
    keyAlias: key,
    objectIndexAlias: index,
    parseResult,
    children: isTemplateNode(node) ? node.children : [node], // 確保資料始終是陣列
  };

  context.replaceNode(forNode);

  // bookkeeping
  scopes.vFor++;

  const onExit = processCodegen && processCodegen(forNode);

  return (): void => {
    scopes.vFor--;
    if (onExit) onExit();
  };
}

export function finalizeForParseResult(
  result: ForParseResult,
  context: TransformContext
): void {
  result.finalized = true;
}

export function createForLoopParams(
  { value, key, index }: ForParseResult,
  memoArgs: ExpressionNode[] = []
): ExpressionNode[] {
  return createParamsList([value, key, index, ...memoArgs]);
}

function createParamsList(
  args: (ExpressionNode | undefined)[]
): ExpressionNode[] {
  let i = args.length;
  while (i--) {
    if (args[i]) break;
  }
  return args
    .slice(0, i + 1)
    .map((arg, i) => arg || createSimpleExpression(`_`.repeat(i + 1), false));
}
