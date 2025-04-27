// compiler-core
import { camelize } from "../../../shared/src/general.js";
import {
  createCompoundExpression,
  createObjectProperty,
  createSimpleExpression,
  ElementTypes,
  ExpressionNode,
  Property,
} from "../ast.js";
import { DirectiveTransform } from "../transform.js";
import { isStaticExp } from "../utils.js";

export const transformModel: DirectiveTransform = (dir, node, context) => {
  const { exp, arg } = dir;

  if (!exp) {
    return createTransformProps();
  }

  const propName = arg ? arg : createSimpleExpression("modelValue", true);
  const eventName = arg
    ? isStaticExp(arg)
      ? `onUpdate:${camelize(arg.content)}`
      : createCompoundExpression(['"onUpdate:" + ', arg])
    : `onUpdate:modelValue`;

  let assignmentExp: ExpressionNode;
  const eventArg = context.isTS ? `($event: any)` : `$event`;

  assignmentExp = createCompoundExpression([
    `${eventArg} => ((`,
    exp,
    `) = $event)`,
  ]);

  const props = [
    // modelValue: foo
    createObjectProperty(propName, dir.exp!),
    // "onUpdate:modelValue": $event => (foo = $event)
    createObjectProperty(eventName, assignmentExp),
  ];

  if (dir.modifiers.length && node.tagType === ElementTypes.COMPONENT) {
    console.log("COMPONENT");
  }

  return createTransformProps(props);
};

function createTransformProps(props: Property[] = []) {
  return { props };
}
