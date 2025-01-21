import { NodeTransform } from "../transform.js";

export const transformElement: NodeTransform = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode!;
  };
};
