import { camelize, toHandlerKey } from "../../../shared/src/general.js";
import {
  createObjectProperty,
  createSimpleExpression,
  DirectiveNode,
  ElementTypes,
  ExpressionNode,
  NodeTypes,
  SimpleExpressionNode,
} from "../ast.js";
import { DirectiveTransform, DirectiveTransformResult } from "../transform.js";

export interface VOnDirectiveNode extends DirectiveNode {
  // v-on without arg is handled directly in ./transformElements.ts due to it affecting
  // codegen for the entire props object. This transform here is only for v-on
  // *with* args.
  arg: ExpressionNode;
  // exp is guaranteed to be a simple expression here because v-on w/ arg is
  // skipped by transformExpression as a special case.
  exp: SimpleExpressionNode | undefined;
}

export const transformOn: DirectiveTransform = (
  dir, //prop
  node,
  context,
  augmentor
) => {
  const { loc, modifiers, arg } = dir as VOnDirectiveNode;
  let eventName!: ExpressionNode;

  if (arg.type === NodeTypes.SIMPLE_EXPRESSION) {
    if (arg.isStatic) {
      let rawName = arg.content; // click, input...
      const eventString = toHandlerKey(camelize(rawName));
      eventName = createSimpleExpression(eventString, true, arg.loc);
    }
  } else {
    eventName = arg;
  }

  // handler processing
  let exp: ExpressionNode | undefined = dir.exp as
    | SimpleExpressionNode
    | undefined;
  if (exp && !exp.content.trim()) {
    exp = undefined;
  }
  let shouldCache: boolean = context.cacheHandlers && !exp && !context.inVOnce;
  if (exp) {
  }

  let ret: DirectiveTransformResult = {
    props: [
      createObjectProperty(
        eventName,
        exp || createSimpleExpression(`() => {}`, false, loc)
      ),
    ],
  };
  ret.props.forEach((p) => (p.key.isHandlerKey = true));
  return ret;
};
