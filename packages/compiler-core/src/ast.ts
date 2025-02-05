import { isString } from "../../shared/src/general.js";
import { PatchFlags } from "../../shared/src/patchFlags.js";
import {
  CREATE_BLOCK,
  CREATE_ELEMENT_BLOCK,
  CREATE_ELEMENT_VNODE,
  CREATE_VNODE,
  OPEN_BLOCK,
  RENDER_LIST,
  RENDER_SLOT,
  WITH_DIRECTIVES,
} from "./runtimeHelpers.js";
import { TransformContext } from "./transform.js";
import { PropsExpression } from "./transforms/transformElement.js";

type BabelNode = any;

/**
 * 節點表達式
 */
export enum NodeTypes {
  /**
   * 根節點，代表整個模板的根AST樹
   */
  ROOT,
  /**
   * 元素節點，對應HTML標籤或組件
   */
  ELEMENT,
  /**
   * 純文字節點，代表模板中的靜態文本
   */
  TEXT,
  /**
   * 註解節點，對應模板中的註解 `<!-- comment -->`
   */
  COMMENT,
  /**
   * 簡單表達式節點，對應靜態或動態的單個表達式
   */
  SIMPLE_EXPRESSION,
  /**
   * 插值節點，對應 `{{ 表達式 }}`
   */
  INTERPOLATION,
  /**
   * 屬性節點，對應HTML標籤的屬性，如 `id="app"`
   */
  ATTRIBUTE,
  /**
   * 指令節點，對應Vue中的指令，如 `v-if`、`v-for`
   */
  DIRECTIVE,
  /**
   * 複合表達式節點，對應多個表達式組合的情況
   */
  COMPOUND_EXPRESSION,
  /**
   * if節點，對應 `v-if` 指令
   */
  IF,
  /**
   * if分支節點，對應 `v-if` 的每個條件分支
   */
  IF_BRANCH,
  /**
   * for節點，對應 `v-for` 指令
   */
  FOR,
  /**
   * 文字調用節點，用於生成代碼時的文本處理
   */
  TEXT_CALL,
  /**
   * 虛擬節點調用，對應 `createVNode` 的調用
   */
  VNODE_CALL,
  /**
   * JavaScript函數調用表達式，對應代碼中的函數調用
   */
  JS_CALL_EXPRESSION,
  /**
   * JavaScript對象表達式，對應代碼中的對象
   */
  JS_OBJECT_EXPRESSION,
  /**
   * JavaScript對象屬性表達式，對應代碼中的對象屬性
   */
  JS_PROPERTY,
  /**
   * JavaScript數組表達式，對應代碼中的數組
   */
  JS_ARRAY_EXPRESSION,
  /**
   * JavaScript函數表達式，對應代碼中的函數
   */
  JS_FUNCTION_EXPRESSION,
  /**
   * JavaScript條件表達式，對應 `a ? b : c` 這類結構
   */
  JS_CONDITIONAL_EXPRESSION,
  /**
   * JavaScript緩存表達式，用於優化代碼執行
   */
  JS_CACHE_EXPRESSION,
  /**
   * JavaScript代碼塊，用於SSR生成的代碼塊
   */
  JS_BLOCK_STATEMENT,
  /**
   * JavaScript模板字面量，用於字符串插值
   */
  JS_TEMPLATE_LITERAL,
  /**
   * JavaScript if語句，用於SSR條件渲染
   */
  JS_IF_STATEMENT,
  /**
   * JavaScript賦值表達式，用於變量賦值
   */
  JS_ASSIGNMENT_EXPRESSION,
  /**
   * JavaScript序列表達式，用於多個表達式組合
   */
  JS_SEQUENCE_EXPRESSION,
  /**
   * JavaScript返回語句，用於函數返回
   */
  JS_RETURN_STATEMENT,
}
/**
 * 靜態節點類型
 */
export enum ConstantTypes {
  /**
   * 非靜態的節點(v-if,v-for)
   */
  NOT_CONSTANT = 0,
  /**
   * 可以跳過補丁的節點
   */
  CAN_SKIP_PATCH,
  /**
   * 可以緩存的節點
   */
  CAN_CACHE,
  /**
   * 完全靜態可直接編譯成文字
   */
  CAN_STRINGIFY,
}

export type JSChildNode =
  | VNodeCall
  | SimpleExpressionNode
  | ArrayExpression
  | ExpressionNode
  | CallExpression
  | ObjectExpression;

/**
 * 代碼在文檔中的具體位置
 */
export interface Position {
  offset: number; // from start of file
  line: number;
  column: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source: string;
}

export interface Node {
  type: NodeTypes;
  loc: SourceLocation;
}

export interface CallExpression extends Node {
  type: NodeTypes.JS_CALL_EXPRESSION;
  callee: string | symbol;
  arguments: (
    | string
    | symbol
    | JSChildNode
    // | SSRCodegenNode
    | TemplateChildNode
    | TemplateChildNode[]
  )[];
}

export type ParentNode = RootNode | ElementNode;

export interface RootNode extends Node {
  type: NodeTypes.ROOT;
  source: string;
  children: TemplateChildNode[];
  helpers: Set<symbol>;
  components: string[];
  directives: string[];
  hoists: (any | null)[];
  imports: any[];
  cached: (any | null)[];
  temps: number;
  ssrHelpers?: symbol[];
  codegenNode?: any;
  transformed?: boolean;

  // v2 compat only
  filters?: string[];
}

export enum Namespaces {
  HTML,
  SVG,
  MATH_ML,
}

export enum ElementTypes {
  ELEMENT,
  COMPONENT,
  SLOT,
  TEMPLATE,
}

export interface TextNode extends Node {
  type: NodeTypes.TEXT;
  content: string;
}

export interface AttributeNode extends Node {
  type: NodeTypes.ATTRIBUTE;
  name: string;
  nameLoc: SourceLocation;
  value: TextNode | undefined;
}

export type Namespace = number;

export type ElementNode = PlainElementNode | ComponentNode | TemplateNode;

export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode;

export interface ComponentNode extends BaseElementNode {
  tagType: ElementTypes.COMPONENT;
  codegenNode:
    | VNodeCall
    | CacheExpression // when cached by v-once
    // | MemoExpression // when cached by v-memo
    | undefined;
  ssrCodegenNode?: CallExpression;
}

export interface CompoundExpressionNode extends Node {
  type: NodeTypes.COMPOUND_EXPRESSION;
  /**
   * - `null` means the expression is a simple identifier that doesn't need
   *    parsing
   * - `false` means there was a parsing error
   */
  ast?: BabelNode | null | false;
  children: (
    | SimpleExpressionNode
    | CompoundExpressionNode
    | InterpolationNode
    | TextNode
    | string
    | symbol
  )[];
}

export interface ForParseResult {
  source: ExpressionNode;
  value: ExpressionNode | undefined;
  key: ExpressionNode | undefined;
  index: ExpressionNode | undefined;
  finalized: boolean;
}

export interface Property extends Node {
  type: NodeTypes.JS_PROPERTY;
  key: ExpressionNode;
  value: JSChildNode;
}

export interface DirectiveNode extends Node {
  type: NodeTypes.DIRECTIVE;
  /**
   * the normalized name without prefix or shorthands, e.g. "bind", "on"
   */
  name: string;
  /**
   * the raw attribute name, preserving shorthand, and including arg & modifiers
   * this is only used during parse.
   */
  rawName?: string;
  exp: ExpressionNode | undefined;
  arg: ExpressionNode | undefined;
  modifiers: SimpleExpressionNode[];
  /**
   * optional property to cache the expression parse result for v-for
   */
  forParseResult?: ForParseResult;
}

export type TemplateChildNode =
  | ElementNode
  | TextNode
  | CommentNode
  | InterpolationNode
  | TextCallNode
  | CompoundExpressionNode
  | TemplateNode;

export interface TextCallNode extends Node {
  type: NodeTypes.TEXT_CALL;
  content: TextNode | InterpolationNode | CompoundExpressionNode;
  codegenNode: CallExpression | SimpleExpressionNode; // when hoisted
}

export interface CommentNode extends Node {
  type: NodeTypes.COMMENT;
  content: string;
}

export interface InterpolationNode extends Node {
  type: NodeTypes.INTERPOLATION;
  content: ExpressionNode;
}

export interface BaseElementNode extends Node {
  type: NodeTypes.ELEMENT;
  ns: Namespace;
  tag: string;
  tagType: ElementTypes;
  props: Array<AttributeNode | DirectiveNode>;
  children: TemplateChildNode[];
  isSelfClosing?: boolean;
  innerLoc?: SourceLocation; // only for SFC root level elements
  // codegenNode: any;
}

export interface PlainElementNode extends BaseElementNode {
  tagType: ElementTypes.ELEMENT;
  codegenNode: undefined | VNodeCall | SimpleExpressionNode;
  ssrCodegenNode?: TemplateLiteral;
}

export interface TemplateLiteral extends Node {
  type: NodeTypes.JS_TEMPLATE_LITERAL;
  elements: (string | JSChildNode)[];
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source: string;
}

export interface Position {
  offset: number; // from start of file
  line: number;
  column: number;
}

export const locStub: SourceLocation = {
  start: { line: 1, column: 1, offset: 0 },
  end: { line: 1, column: 1, offset: 0 },
  source: "",
};

export function createRoot(children: any[], source = ""): RootNode {
  return {
    type: NodeTypes.ROOT,
    source,
    children,
    helpers: new Set(),
    components: [],
    directives: [],
    hoists: [],
    imports: [],
    cached: [],
    temps: 0,
    codegenNode: undefined,
    loc: locStub,
  };
}

export interface SimpleExpressionNode extends Node {
  type: NodeTypes.SIMPLE_EXPRESSION;
  content: string;
  isStatic: boolean;
  constType: ConstantTypes;
  /**
   * - `null` means the expression is a simple identifier that doesn't need
   *    parsing
   * - `false` means there was a parsing error
   */
  ast?: BabelNode | null | false;
  /**
   * Indicates this is an identifier for a hoist vnode call and points to the
   * hoisted node.
   */
  hoisted?: JSChildNode;
  /**
   * an expression parsed as the params of a function will track
   * the identifiers declared inside the function body.
   */
  identifiers?: string[];
  isHandlerKey?: boolean;
}

export interface CacheExpression extends Node {
  type: NodeTypes.JS_CACHE_EXPRESSION;
  index: number;
  value: JSChildNode;
  needPauseTracking: boolean;
  needArraySpread: boolean;
}

export interface ArrayExpression extends Node {
  type: NodeTypes.JS_ARRAY_EXPRESSION;
  elements: Array<string | Node>;
}

export interface TemplateNode extends BaseElementNode {
  tagType: ElementTypes.TEMPLATE;
  // TemplateNode is a container type that always gets compiled away
  codegenNode: undefined;
}

export type TemplateTextChildNode =
  | TextNode
  | InterpolationNode
  | CompoundExpressionNode;

export type SlotsExpression = {};

export interface FunctionExpression extends Node {}

export interface ForIteratorExpression extends FunctionExpression {
  returns?: BlockCodegenNode;
}

export type BlockCodegenNode = VNodeCall;
export interface ForRenderListExpression extends CallExpression {
  callee: typeof RENDER_LIST;
  arguments: any;
}

export interface DirectiveArguments extends ArrayExpression {
  elements: DirectiveArgumentNode[];
}

export interface ObjectExpression extends Node {
  type: NodeTypes.JS_OBJECT_EXPRESSION;
  properties: Array<Property>;
}

export interface DirectiveArgumentNode extends ArrayExpression {
  elements: // dir, exp, arg, modifiers
  | [string]
    | [string, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode]
    | [string, ExpressionNode, ExpressionNode, ObjectExpression];
}
/**
 * 渲染函式的核心
 */
export interface VNodeCall extends Node {
  type: NodeTypes.VNODE_CALL;
  tag: string | symbol | CallExpression;
  props: PropsExpression | undefined;
  children:
    | TemplateChildNode[] // multiple children
    | TemplateTextChildNode // single text child
    | SlotsExpression // component slots
    | ForRenderListExpression // v-for fragment call
    | SimpleExpressionNode // hoisted
    | CacheExpression // cached
    | undefined;
  /**
   * 決定 Vue 如何優化該 VNode
   */
  patchFlag: PatchFlags | undefined;
  dynamicProps: string | SimpleExpressionNode | undefined;
  directives: DirectiveArguments | undefined;
  isBlock: boolean;
  disableTracking: boolean;
  isComponent: boolean;
}

// renderSlot(...)
export interface RenderSlotCall extends CallExpression {
  callee: typeof RENDER_SLOT;
  // arguments: // $slots, name, props, fallback

  // | [string, string | ExpressionNode]
  //   | [string, string | ExpressionNode, PropsExpression]
  //   | [
  //       string,
  //       string | ExpressionNode,
  //       PropsExpression | "{}",
  //       TemplateChildNode[]
  //     ];
  arguments: any;
}

type InferCodegenNodeType<T> = T extends typeof RENDER_SLOT
  ? RenderSlotCall
  : CallExpression;

/**
 * 創建一個 JavaScript 物件表達式節點（ObjectExpression），
 * 用於 AST 轉換過程中表示物件字面量。
 *
 * @param properties - 物件屬性陣列，每個屬性都是一個 `Property` 節點
 * @param loc - 物件在模板中的位置信息，預設為 `locStub`
 * @returns 返回 `ObjectExpression`，表示 JavaScript 的 `{ key: value }`
 */
export function createObjectExpression(
  properties: ObjectExpression["properties"],
  loc: SourceLocation = locStub
): ObjectExpression {
  return {
    type: NodeTypes.JS_OBJECT_EXPRESSION,
    loc,
    properties,
  };
}

/**
 * 返回物件(key:value)
 */
export function createObjectProperty(
  key: Property["key"] | string,
  value: Property["value"]
): Property {
  return {
    type: NodeTypes.JS_PROPERTY,
    loc: locStub,
    key: isString(key) ? createSimpleExpression(key, true) : key,
    value,
  };
}

export function createVNodeCall(
  context: TransformContext | null,
  tag: VNodeCall["tag"],
  props?: VNodeCall["props"],
  children?: VNodeCall["children"],
  patchFlag?: VNodeCall["patchFlag"],
  dynamicProps?: VNodeCall["dynamicProps"],
  directives?: VNodeCall["directives"],
  isBlock: VNodeCall["isBlock"] = false,
  disableTracking: VNodeCall["disableTracking"] = false,
  isComponent: VNodeCall["isComponent"] = false,
  loc: SourceLocation = locStub
): VNodeCall {
  if (context) {
    if (isBlock) {
      context.helper(OPEN_BLOCK);
      context.helper(getVNodeBlockHelper(context.inSSR, isComponent));
    } else {
      context.helper(getVNodeHelper(context.inSSR, isComponent));
    }
    if (directives) {
      context.helper(WITH_DIRECTIVES);
    }
  }

  return {
    type: NodeTypes.VNODE_CALL,
    tag,
    props,
    children,
    patchFlag,
    dynamicProps,
    directives,
    isBlock,
    disableTracking,
    isComponent,
    loc,
  };
}

export function getVNodeBlockHelper(
  ssr: boolean,
  isComponent: boolean
): typeof CREATE_BLOCK | typeof CREATE_ELEMENT_BLOCK {
  return ssr || isComponent ? CREATE_BLOCK : CREATE_ELEMENT_BLOCK;
}

export function getVNodeHelper(
  ssr: boolean,
  isComponent: boolean
): typeof CREATE_VNODE | typeof CREATE_ELEMENT_VNODE {
  return ssr || isComponent ? CREATE_VNODE : CREATE_ELEMENT_VNODE;
}

export function convertToBlock(
  node: VNodeCall,
  { helper, removeHelper, inSSR }: TransformContext
): void {
  if (!node.isBlock) {
    node.isBlock = true;
    removeHelper(getVNodeHelper(inSSR, node.isComponent));
    helper(OPEN_BLOCK);
    helper(getVNodeBlockHelper(inSSR, node.isComponent));
  }
}

export function createCallExpression<T extends CallExpression["callee"]>(
  callee: T,
  args: CallExpression["arguments"] = [],
  loc: SourceLocation = locStub
): InferCodegenNodeType<T> {
  return {
    type: NodeTypes.JS_CALL_EXPRESSION,
    loc,
    callee,
    arguments: args,
  } as InferCodegenNodeType<T>;
}

/**
 * 創建 AST 的簡單表達式節點（SimpleExpressionNode）
 *
 * @param content - 表達式的內容，例如 `"msg"` 或 `"1 + 1"`
 * @param isStatic - 是否為靜態表達式，預設為 `false`
 * @param loc - 表達式在原始模板中的位置信息，預設為 `locStub`
 * @param constType - 常量類型，決定該表達式是否可以進一步優化，預設為 `NOT_CONSTANT`
 * @returns 返回一個 `SimpleExpressionNode`，用於 AST 轉換過程
 */
export function createSimpleExpression(
  content: SimpleExpressionNode["content"],
  isStatic: SimpleExpressionNode["isStatic"] = false,
  loc: SourceLocation = locStub,
  constType: ConstantTypes = ConstantTypes.NOT_CONSTANT
): SimpleExpressionNode {
  return {
    type: NodeTypes.SIMPLE_EXPRESSION,
    loc,
    content,
    isStatic,
    constType: isStatic ? ConstantTypes.CAN_STRINGIFY : constType,
  };
}
