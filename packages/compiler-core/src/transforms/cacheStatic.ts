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
  // console.log("children", children);

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // 只有一般節點及文字可以使用快取
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
        const codegenNode = child.codegenNode!;
        if (codegenNode.type === NodeTypes.VNODE_CALL) {
          const flag = codegenNode.patchFlag;
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
    } else if (child.type === NodeTypes.TEXT_CALL) {
      const constantType = doNotHoistNode
        ? ConstantTypes.NOT_CONSTANT
        : getConstantType(child, context);
      if (constantType >= ConstantTypes.CAN_CACHE) {
        toCache.push(child);
        continue;
      }
    }

    // walk further
    if (child.type === NodeTypes.ELEMENT) {
      walk(child, node, context, false, inFor);
    }
  }
}

export function getConstantType(
  node: TemplateChildNode | SimpleExpressionNode | CacheExpression,
  context: TransformContext
): ConstantTypes {
  const { constantCache } = context;

  switch (node.type) {
    case NodeTypes.ELEMENT:
      if (node.tagType !== ElementTypes.ELEMENT) {
        return ConstantTypes.NOT_CONSTANT;
      }
      const cached = constantCache.get(node);

      if (cached !== undefined) {
        return cached;
      }
      const codegenNode = node.codegenNode!;
      if (codegenNode.type !== NodeTypes.VNODE_CALL) {
        return ConstantTypes.NOT_CONSTANT;
      }
      if (codegenNode.patchFlag === undefined) {
        let returnType = ConstantTypes.CAN_STRINGIFY;

        // 遍歷子節點，確保所有子節點都是靜態的
        for (let i = 0; i < node.children.length; i++) {
          const childType = getConstantType(node.children[i], context);
          if (childType === ConstantTypes.NOT_CONSTANT) {
            constantCache.set(node, ConstantTypes.NOT_CONSTANT);
            return ConstantTypes.NOT_CONSTANT;
          }
          if (childType < returnType) {
            returnType = childType;
          }
        }
        constantCache.set(node, returnType);
        return returnType;
      } else {
        constantCache.set(node, ConstantTypes.NOT_CONSTANT);
        return ConstantTypes.NOT_CONSTANT;
      }
    case NodeTypes.TEXT:
    case NodeTypes.COMMENT:
      return ConstantTypes.CAN_STRINGIFY;
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
