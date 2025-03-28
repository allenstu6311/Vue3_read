import { DirectiveTransform } from "../transform.js";

export const transformModel: DirectiveTransform = (dir, node, context) => {
  // 看到這裡
  console.log("transformModel");

  return null as any;
};
