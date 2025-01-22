import {
  camelize,
  capitalize,
  EMPTY_OBJ,
  isArray,
  isString,
  NOOP,
} from "../../shared/src/general.js";
import {
  ArrayExpression,
  CacheExpression,
  ConstantTypes,
  DirectiveNode,
  ElementNode,
  ExpressionNode,
  JSChildNode,
  NodeTypes,
  ParentNode,
  Property,
  RootNode,
  SimpleExpressionNode,
  TemplateChildNode,
  TemplateLiteral,
} from "./ast.js";
import { CompilerCompatOptions } from "./compact/compatConfig.js";
import { defaultOnError, defaultOnWarn } from "./errors.js";
import { TransformOptions } from "./options.js";
import { TO_DISPLAY_STRING } from "./runtimeHelpers.js";

export type NodeTransform = (
  node: RootNode | TemplateChildNode,
  context: TransformContext
) => void | (() => void) | (() => void)[];

export interface ImportItem {
  exp: string | ExpressionNode;
  path: string;
}

/**
 * 记录和管理模板编译时的各种信息
 */
export interface TransformContext
  extends Required<Omit<TransformOptions, keyof CompilerCompatOptions>>,
    CompilerCompatOptions {
  selfName: string | null;
  root: RootNode;
  helpers: Map<symbol, number>;
  components: Set<string>;
  directives: Set<string>;
  hoists: (JSChildNode | null)[];
  imports: ImportItem[];
  temps: number;
  cached: (CacheExpression | null)[];
  identifiers: { [name: string]: number | undefined };
  scopes: {
    vFor: number;
    vSlot: number;
    vPre: number;
    vOnce: number;
  };
  parent: ParentNode | null;
  // we could use a stack but in practice we've only ever needed two layers up
  // so this is more efficient
  grandParent: ParentNode | null;
  childIndex: number;
  currentNode: RootNode | TemplateChildNode | null;
  inVOnce: boolean;
  helper<T extends symbol>(name: T): T;
  removeHelper<T extends symbol>(name: T): void;
  helperString(name: symbol): string;
  replaceNode(node: TemplateChildNode): void;
  removeNode(node?: TemplateChildNode): void;
  onNodeRemoved(): void;
  addIdentifiers(exp: ExpressionNode | string): void;
  removeIdentifiers(exp: ExpressionNode | string): void;
  hoist(exp: string | JSChildNode | ArrayExpression): SimpleExpressionNode;
  cache(exp: JSChildNode, isVNode?: boolean): CacheExpression;
  constantCache: WeakMap<TemplateChildNode, ConstantTypes>;

  // 2.x Compat only
  filters?: Set<string>;
}

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

export function createTransformContext(
  root: RootNode,
  {
    filename = "",
    prefixIdentifiers = false,
    hoistStatic = false,
    hmr = false,
    cacheHandlers = false,
    nodeTransforms = [],
    directiveTransforms = {},
    transformHoist = null,
    isBuiltInComponent = NOOP,
    isCustomElement = NOOP,
    expressionPlugins = [],
    scopeId = null,
    slotted = true,
    ssr = false,
    inSSR = false,
    ssrCssVars = ``,
    bindingMetadata = EMPTY_OBJ,
    inline = false,
    isTS = false,
    onError = defaultOnError,
    onWarn = defaultOnWarn,
    compatConfig,
  }: TransformOptions
): TransformContext {
  const nameMatch = filename.replace(/\?.*$/, "").match(/([^/\\]+)\.\w+$/);
  const context: TransformContext | any = {
    filename,
    selfName: nameMatch && capitalize(camelize(nameMatch[1])),
    prefixIdentifiers,
    hoistStatic,
    hmr,
    cacheHandlers,
    nodeTransforms,
    directiveTransforms,
    transformHoist,
    isBuiltInComponent,
    isCustomElement,
    expressionPlugins,
    scopeId,
    slotted,
    ssr,
    inSSR,
    ssrCssVars,
    bindingMetadata,
    inline,
    isTS,
    onError,
    onWarn,
    compatConfig,

    // state
    root,
    helpers: new Map(),
    components: new Set(),
    directives: new Set(),
    hoists: [],
    imports: [],
    cached: [],
    constantCache: new WeakMap(),
    temps: 0,
    identifiers: Object.create(null),
    scopes: {
      vFor: 0,
      vSlot: 0,
      vPre: 0,
      vOnce: 0,
    },
    parent: null,
    grandParent: null,
    currentNode: root,
    childIndex: 0,
    inVOnce: false,

    // methods
    helper(name: string) {
      const count = context.helpers.get(name) || 0;
      context.helpers.set(name, count + 1);
      return name; //Symbol()
    },
  };

  return context;
}

export function transform(root: RootNode, options: TransformOptions): void {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  console.log("node", root);

  createRootCodegen(root, context);
}

function createRootCodegen(root: RootNode, context: TransformContext) {
  const { helper } = context;
  const { children } = root;
  if (children.length === 1) {
    const child = children[0];
    // console.log("root", root);
  }
}

/**
 * 賦值父母、祖父母層級
 * 慢慢找到文字或表達
 */
export function traverseChildren(
  parent: ParentNode,
  context: TransformContext
): void {
  let i = 0;
  const nodeRemoved = () => {
    i--;
  };
  for (; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (isString(child)) continue;
    context.grandParent = context.parent;
    context.parent = parent;
    context.childIndex = i;
    context.onNodeRemoved = nodeRemoved;
    traverseNode(child, context);
  }
}

export function traverseNode(
  node: RootNode | TemplateChildNode, // ast
  context: TransformContext
): void {
  context.currentNode = node;
  // apply transform plugins
  const { nodeTransforms } = context;
  const exitFns = [];

  for (let i = 0; i < nodeTransforms.length; i++) {
    // 整理transform方法
    const onExit = nodeTransforms[i](node, context);

    if (onExit) {
      if (isArray(onExit)) {
        exitFns.push(...onExit);
      } else {
        exitFns.push(onExit);
      }
    }
    if (!context.currentNode) {
      // node was removed
      return;
    } else {
      // node may have been replaced
      node = context.currentNode;
    }
  }
  //   console.log("node", node);

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      // no need to traverse, but we need to inject toString helper
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context);
      break;
    default:
      break;
  }
  // exit transforms
  context.currentNode = node;
  let i = exitFns.length;
  while (i--) {
    // 執行transform方法
    exitFns[i]();
  }
}
