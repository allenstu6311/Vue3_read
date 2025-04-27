import { DirectiveTransform } from "../../../compiler-core/src/transform";

// compiler-dom
export const transformModel: DirectiveTransform = (dir, node, context) => {
  // 看到這裡
  console.log("transformModel");

  return null as any;
};
