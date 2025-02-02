import { PatchFlags } from "../../../shared/src/patchFlags.js";
import {
  CacheExpression,
  ComponentNode,
  ConstantTypes,
  ElementTypes,
  NodeTypes,
  ParentNode,
  PlainElementNode,
  RootNode,
  SimpleExpressionNode,
  TemplateChildNode,
  TemplateNode,
  TextCallNode,
} from "../ast.js";
import { TransformContext } from "../transform.js";

export function cacheStatic(root: RootNode, context: TransformContext): void {
  walk(
    root,
    undefined,
    context,
    // 根節點不提升的原因：可能會受到父級屬性的影響（fallthrough attributes）
    isSingleElementRoot(root, root.children[0])
  );
}

function walk(
  node: ParentNode,
  parent: ParentNode | undefined,
  context: TransformContext,
  doNotHoistNode: boolean = false, // 不要提升節點
  inFor = false
) {
  const { children } = node;
  const toCache: (PlainElementNode | TextCallNode)[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (
      child.type === NodeTypes.ELEMENT &&
      child.tagType === ElementTypes.ELEMENT
    ) {
      /**
       * 不能提升代表為非靜態節點
       */
      const constantType = doNotHoistNode
        ? ConstantTypes.NOT_CONSTANT
        : getConstantType(child, context);

      if (constantType > ConstantTypes.NOT_CONSTANT) {
        // 建立快取
        if (constantType >= ConstantTypes.CAN_CACHE) {
          toCache.push(child);
          continue;
        }
      } else {
        // 目前會走這裡
        const codegenNode = child.codegenNode!;
        if (codegenNode.type === NodeTypes.VNODE_CALL) {
          const flag = codegenNode.patchFlag;
          // console.log("flag", flag);
          if (
            (flag === undefined ||
              flag === PatchFlags.NEED_PATCH ||
              flag === PatchFlags.TEXT) &&
            getGeneratedPropsConstantType(child, context) >=
              ConstantTypes.CAN_CACHE
          ) {
            const props = getNodeProps(child);
            if (props) {
              codegenNode.props = context.hoist(props);
            }
          }
        }
      }
    }
  }
}

export function getConstantType(
  node: TemplateChildNode | SimpleExpressionNode | CacheExpression,
  context: TransformContext
): ConstantTypes {
  const { constantCache } = context;
  // console.log("node.type", node);
  switch (node.type) {
    // case NodeTypes.ELEMENT:
    //   break;
    case NodeTypes.INTERPOLATION:
    case NodeTypes.TEXT_CALL:
      return getConstantType(node.content, context);

    default:
      return ConstantTypes.NOT_CONSTANT;
  }

  // return null as any;
}

function getGeneratedPropsConstantType(
  node: PlainElementNode,
  context: TransformContext
): ConstantTypes {
  let returnType = ConstantTypes.CAN_STRINGIFY;
  // console.log("node", node);

  const props = getNodeProps(node);
  // console.log("props", props);

  return returnType;
}

function getNodeProps(node: PlainElementNode) {
  const codegenNode = node.codegenNode!;
  if (codegenNode.type === NodeTypes.VNODE_CALL) {
    return codegenNode.props;
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
