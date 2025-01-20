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
 * 常數類型
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

export type JSChildNode = {};

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

export interface RootNode extends Node {
  type: NodeTypes.ROOT;
  source: string;
  children: any[];
  helpers: Set<symbol>;
  components: string[];
  directives: string[];
  hoists: (any | null)[];
  imports: any[];
  cached: (any | null)[];
  temps: number;
  ssrHelpers?: symbol[];
  codegenNode?: any | any | any;
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

export type ElementNode = BaseElementNode | PlainElementNode;

export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode;

export interface CompoundExpressionNode extends Node {}

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
  | InterpolationNode;

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
}

export interface PlainElementNode extends BaseElementNode {
  tagType: ElementTypes.ELEMENT;
  codegenNode: undefined;
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
