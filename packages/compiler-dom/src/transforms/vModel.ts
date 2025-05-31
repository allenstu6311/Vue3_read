import { ElementTypes, NodeTypes } from "../../../compiler-core/src/ast.js";
import { DirectiveTransform } from "../../../compiler-core/src/transform.js";
import { transformModel as baseTransform } from "../../../compiler-core/src/transforms/vModel.js";
import { findProp } from "../../../compiler-core/src/utils.js";
import { V_MODEL_TEXT } from "../runtimeHelpers.js";
// compiler-dom
export const transformModel: DirectiveTransform = (dir, node, context) => {
  const baseResult = baseTransform(dir, node, context);
  if (!baseResult.props.length || node.tagType === ElementTypes.COMPONENT) {
    return baseResult
  }

  if (dir.arg) {
    // 僅限於組件可以使用v-molde:test這種傳遞參數的方式
    // 在這裡Vue會報一個錯誤
  }

  const { tag } = node;
  const isCustomElement = context.isCustomElement(tag);
  if (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    isCustomElement
  ) {
    let directiveToUse = V_MODEL_TEXT
    let isInvalidType = false

    if (tag === 'input' || isCustomElement) {
      const type = findProp(node, `type`);
      if (type) {
        if (type.type === NodeTypes.DIRECTIVE) {

        } else if (type.value) {
          switch (type.value.content) { }
        }
      }

    } else if (tag === 'select') {

    } else { }


    if(!isInvalidType){
      baseResult.needRuntime = context.helper(directiveToUse)
    }
  }
  return baseResult;
};
