
type BabelNode = any

export enum NodeTypes {
  ROOT,
  ELEMENT,
  TEXT,
  COMMENT,
  SIMPLE_EXPRESSION,
  INTERPOLATION,
  ATTRIBUTE,
  DIRECTIVE,
  // containers
  COMPOUND_EXPRESSION,
  IF,
  IF_BRANCH,
  FOR,
  TEXT_CALL,
  // codegen
  VNODE_CALL,
  JS_CALL_EXPRESSION,
  JS_OBJECT_EXPRESSION,
  JS_PROPERTY,
  JS_ARRAY_EXPRESSION,
  JS_FUNCTION_EXPRESSION,
  JS_CONDITIONAL_EXPRESSION,
  JS_CACHE_EXPRESSION,

  // ssr codegen
  JS_BLOCK_STATEMENT,
  JS_TEMPLATE_LITERAL,
  JS_IF_STATEMENT,
  JS_ASSIGNMENT_EXPRESSION,
  JS_SEQUENCE_EXPRESSION,
  JS_RETURN_STATEMENT,
}

/**
 * 節點類型
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

export type JSChildNode = {}

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
  type: NodeTypes.TEXT
  content: string
}

export interface AttributeNode extends Node {
  type: NodeTypes.ATTRIBUTE
  name: string
  nameLoc: SourceLocation
  value: TextNode | undefined
}

export type Namespace = number;

export type ElementNode = BaseElementNode | PlainElementNode

export interface DirectiveNode extends Node {}

export type TemplateChildNode = {}

export interface BaseElementNode extends Node {
  type: NodeTypes.ELEMENT
  ns: Namespace
  tag: string
  tagType: ElementTypes
  props: Array<AttributeNode | DirectiveNode>
  children: TemplateChildNode[]
  isSelfClosing?: boolean
  innerLoc?: SourceLocation // only for SFC root level elements
}

export interface PlainElementNode extends BaseElementNode {
  tagType: ElementTypes.ELEMENT
  codegenNode: undefined
  ssrCodegenNode?: TemplateLiteral
}

export interface TemplateLiteral extends Node {
  type: NodeTypes.JS_TEMPLATE_LITERAL
  elements: (string | JSChildNode)[]
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
  type: NodeTypes.SIMPLE_EXPRESSION
  content: string
  isStatic: boolean
  constType: ConstantTypes
  /**
   * - `null` means the expression is a simple identifier that doesn't need
   *    parsing
   * - `false` means there was a parsing error
   */
  ast?: BabelNode | null | false
  /**
   * Indicates this is an identifier for a hoist vnode call and points to the
   * hoisted node.
   */
  hoisted?: JSChildNode
  /**
   * an expression parsed as the params of a function will track
   * the identifiers declared inside the function body.
   */
  identifiers?: string[]
  isHandlerKey?: boolean
}

export function createSimpleExpression(
  content: SimpleExpressionNode['content'],
  isStatic: SimpleExpressionNode['isStatic'] = false,
  loc: SourceLocation = locStub,
  constType: ConstantTypes = ConstantTypes.NOT_CONSTANT,
): SimpleExpressionNode {
  return {
    type: NodeTypes.SIMPLE_EXPRESSION,
    loc,
    content,
    isStatic,
    constType: isStatic ? ConstantTypes.CAN_STRINGIFY : constType,
  }
}
