import {
  DirectiveNode,
  ElementNode,
  Property,
  RootNode,
  TemplateChildNode,
  TemplateLiteral,
} from "./ast.js";

export type NodeTransform = (
  node: RootNode | TemplateChildNode,
  context: TransformContext
) => void | (() => void) | (() => void)[];

/**
 * 记录和管理模板编译时的各种信息
 */
export interface TransformContext {}

export type DirectiveTransform = (
  dir: DirectiveNode,
  node: ElementNode,
  context: TransformContext,
  // a platform specific compiler can import the base transform and augment
  // it by passing in this optional argument.
  augmentor?: (ret: DirectiveTransformResult) => DirectiveTransformResult
) => DirectiveTransformResult;

export interface DirectiveTransformResult {
  props: Property[];
  needRuntime?: boolean | symbol;
  ssrTagParts?: TemplateLiteral["elements"];
}
