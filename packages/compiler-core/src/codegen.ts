import { isArray, isString, isSymbol } from "../../shared/src/general.js";
import {
  ArrayExpression,
  CacheExpression,
  CallExpression,
  CompoundExpressionNode,
  ExpressionNode,
  FunctionExpression,
  getVNodeBlockHelper,
  getVNodeHelper,
  InterpolationNode,
  JSChildNode,
  NodeTypes,
  ObjectExpression,
  RootNode,
  SimpleExpressionNode,
  TemplateChildNode,
  TextNode,
  VNodeCall,
} from "./ast.js";
import { CodegenContext, CodegenOptions, CodegenResult } from "./options.js";
import {
  helperNameMap,
  OPEN_BLOCK,
  TO_DISPLAY_STRING,
  WITH_DIRECTIVES,
} from "./runtimeHelpers.js";
import { isSimpleIdentifier } from "./utils.js";

const PURE_ANNOTATION = `/*@__PURE__*/`;

type CodegenNode = TemplateChildNode | JSChildNode;
/**
 * renderList => _renderList
 */
const aliasHelper = (s: symbol) => `${helperNameMap[s]}: _${helperNameMap[s]}`;

function createCodegenContext(
  ast: RootNode,
  {
    mode = "function",
    prefixIdentifiers = mode === "module",
    sourceMap = false,
    filename = `template.vue.html`,
    scopeId = null,
    optimizeImports = false,
    runtimeGlobalName = `Vue`,
    runtimeModuleName = `vue`,
    ssrRuntimeModuleName = "vue/server-renderer",
    ssr = false,
    isTS = false,
    inSSR = false,
  }: CodegenOptions
): CodegenContext {
  const context: CodegenContext = {
    mode,
    prefixIdentifiers,
    sourceMap,
    filename,
    scopeId,
    optimizeImports,
    runtimeGlobalName,
    runtimeModuleName,
    ssrRuntimeModuleName,
    ssr,
    isTS,
    inSSR,
    source: ast.source,
    code: ``,
    column: 1,
    line: 1,
    offset: 0,
    indentLevel: 0,
    pure: false,
    map: undefined,

    // method
    helper(key) {
      return `_${helperNameMap[key]}`;
    },
    push(code, newlineIndex = NewlineType.None, node) {
      context.code += code;
    },
    indent() {
      newline(++context.indentLevel);
    },
    deindent(withoutNewLine = false) {
      if (withoutNewLine) {
        --context.indentLevel;
      } else {
        newline(--context.indentLevel);
      }
    },
    newline() {
      newline(context.indentLevel);
    },
  };

  function newline(n: number) {
    context.push("\n" + `  `.repeat(n), NewlineType.Start);
  }

  return context;
}

export function generate(
  ast: RootNode,
  options: CodegenOptions & {
    onContextCreated?: (context: CodegenContext) => void;
  } = {}
): CodegenResult {
  const context = createCodegenContext(ast, options);

  const {
    mode,
    push,
    prefixIdentifiers,
    indent,
    deindent,
    newline,
    scopeId,
    ssr,
  } = context;

  const helpers = Array.from(ast.helpers); // 會使用到的渲染工具
  const hasHelpers = helpers.length > 0;
  const useWithBlock = !prefixIdentifiers && mode !== "module";
  const genScopeId = false;
  const isSetupInlined = false;

  const preambleContext = context;
  genFunctionPreamble(ast, preambleContext);

  // 進入渲染函數
  const functionName = ssr ? `ssrRender` : `render`;
  const args = ssr
    ? ["_ctx", "_push", "_parent", "_attrs"]
    : ["_ctx", "_cache"];

  const signature = args.join(", "); // signature _ctx, _cache

  if (isSetupInlined) {
    push(`(${signature}) => {`);
  } else {
    push(`function ${functionName}(${signature}) {`);
  }
  indent();

  if (useWithBlock) {
    push(`with (_ctx) {`);
    indent();
    // function mode const declarations should be inside with block
    // also they should be renamed to avoid collision with user properties
    if (hasHelpers) {
      // const { renderList: _renderList, Fragment: _Fragment } = _Vue
      push(
        `const { ${helpers.map(aliasHelper).join(", ")} } = _Vue\n`,
        NewlineType.End
      );
      newline();
    }
  }

  // generate asset
  if (ast.components.length) {
  }

  // generate the VNode tree expression
  if (!ssr) {
    push(`return `);
  }

  if (ast.codegenNode) {
    genNode(ast.codegenNode, context);
  } else {
    push(`null`);
  }
  if (useWithBlock) {
    deindent();
    push(`}`);
  }

  deindent();
  push(`}`);
  console.log(context.code);
  return {
    ast,
    code: context.code,
    preamble: "",
  };
}

enum NewlineType {
  /**
   * 表示換行符號 (`\n`) 出現在字串的開頭。
   * 例如："\nHello World"。
   */
  Start = 0,

  /**
   * 表示換行符號 (`\n`) 出現在字串的結尾。
   * 例如："Hello World\n"。
   */
  End = -1,

  /**
   * 表示字串中 **沒有** 換行符號 (`\n`)。
   * 例如："Hello World"。
   */
  None = -2,

  /**
   * 表示無法確定換行符號的位置（可能是解析錯誤或未經過分析）。
   */
  Unknown = -3,
}

/**
 * 正式渲染前的預處理，生成變數或快取
 */
function genFunctionPreamble(ast: RootNode, context: CodegenContext) {
  const {
    ssr,
    prefixIdentifiers,
    push,
    newline,
    runtimeModuleName,
    runtimeGlobalName,
    ssrRuntimeModuleName,
  } = context;

  const VueBinding = runtimeGlobalName;

  const helpers = Array.from(ast.helpers);

  if (helpers.length > 0) {
    push(`const _Vue = ${VueBinding}\n`, NewlineType.End);
  }

  genHoists(ast.hoists, context);
  newline();
  push(`return `);
}

/**
 * 生成靜態變數
 * const _hoisted_1 =
 */
function genHoists(hoists: (JSChildNode | null)[], context: CodegenContext) {
  if (!hoists.length) return;
  context.pure = true; //hoisting 過程中標記生成的代碼為純函數
  const { push, newline } = context;
  newline();

  for (let i = 0; i < hoists.length; i++) {
    const exp = hoists[i];
    if (exp) {
      push(`const _hoisted_${i + 1} = `);
      genNode(exp, context);
      newline();
    }
  }

  context.pure = false;
}

/**
 * 生成hoist變數內容
 * { class:"className" }
 */
function genObjectExpression(node: ObjectExpression, context: CodegenContext) {
  const { push, indent, deindent, newline } = context;
  const { properties } = node;
  if (!properties.length) {
    push(`{}`, NewlineType.None, node);
    return;
  }
  const multilines = properties.length > 1;
  push(multilines ? `{` : `{ `);
  // console.log('properties',properties);
  
  for (let i = 0; i < properties.length; i++) {
    const { key, value } = properties[i];
    genExpressionAsPropertyKey(key, context); //key: class
    push(":");
    // console.log('value',value.type);
    
    genNode(value, context); // value:"className"
    if (i < properties.length - 1) {
      // will only reach this if it's multilines
      push(`,`);
      newline();
    }
  }
  push(multilines ? `}` : ` }`);
}

/**
 * 生成物件屬性的鍵（key），直接輸出到 render 代碼中。
 *
 * - 若 key 是靜態字串，則可能不加引號（符合 JS 識別符規則）。
 * - 若 key 為數字或不符合 JS 識別符規則，則轉換為 JSON 字串（例如 `123` 會變為 `"123"`）。
 */
function genExpressionAsPropertyKey(
  node: ExpressionNode,
  context: CodegenContext
) {
  const { push } = context;
  if (node.type === NodeTypes.COMPOUND_EXPRESSION) {
  } else if (node.isStatic) {
    // 只有在必要時才給物件的 key 加上引號(例 123:"value" => "123":"value")
    const text = isSimpleIdentifier(node.content)
      ? node.content
      : JSON.stringify(node.content);
    push(text, NewlineType.None, node);
  } else {
  }
}

/**
 * 生成物件屬性的值（value），直接輸出到 render 代碼中。
 *
 * - 若值是靜態字串，則轉換為 JSON 字串（確保輸出格式符合 JS 語法）。
 * - 若值是動態表達式，則直接輸出原內容。
 */
function genExpression(node: SimpleExpressionNode, context: CodegenContext) {
  const { content, isStatic } = node;
  context.push(
    isStatic ? JSON.stringify(content) : content,
    NewlineType.Unknown,
    node
  );
}

function genVNodeCall(node: VNodeCall, context: CodegenContext) {
  const { push, helper, pure } = context;
  const {
    tag,
    props,
    children,
    patchFlag,
    dynamicProps,
    directives,
    isBlock,
    disableTracking,
    isComponent,
  } = node;

  let patchFlagString = String(patchFlag); //1

  if (directives) {
    push(helper(WITH_DIRECTIVES) + `(`)
  }

  if (isBlock) {
    push(`(${helper(OPEN_BLOCK)}(${disableTracking ? `true` : ``}), `);
  }

  const callHelper: symbol = isBlock
    ? getVNodeBlockHelper(context.inSSR, isComponent)
    : getVNodeHelper(context.inSSR, isComponent);

  push(helper(callHelper) + `(`, NewlineType.None, node);

  genNodeList(
    genNullableArgs([tag, props, children, patchFlagString, dynamicProps]),
    context
  );
  push(`)`);
  if (isBlock) {
    push(`)`);
  }

  if (directives) {
    push(`, `)
    genNode(directives, context)
    push(`)`)
  }
}

function genNullableArgs(args: any[]): CallExpression["arguments"] {
  let i = args.length;
  while (i--) {
    if (args[i] != null) break;
  }
  return args.slice(0, i + 1).map((arg) => arg || `null`);
}

function genNodeList(
  nodes: (string | symbol | CodegenNode | TemplateChildNode[])[],
  context: CodegenContext,
  multilines: boolean = false,
  comma: boolean = true
) {
  console.log('nodes',nodes);
  
  const { push, newline } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
 
    if (isString(node)) {
      push(node, NewlineType.Unknown);
    } else if (isArray(node)) {
      genNodeListAsArray(node, context);
    } else {
      genNode(node, context);
    }
    if (i < nodes.length - 1) {
      if (multilines) {
        comma && push(",");
        newline();
      } else {
        comma && push(", ");
      }
    }
  }
}

function genNodeListAsArray(
  nodes: (string | CodegenNode | TemplateChildNode[])[],
  context: CodegenContext
) {
  const multilines = nodes.length > 3;

  context.push(`[`);
  multilines && context.indent();
  genNodeList(nodes, context, multilines);
  multilines && context.deindent();
  context.push(`]`);
}

function genText(
  node: TextNode | SimpleExpressionNode,
  context: CodegenContext
) {
  context.push(JSON.stringify(node.content), NewlineType.Unknown, node);
}

/**
 * 合成快取內容
 */
function genCacheExpression(node: CacheExpression, context: CodegenContext) {
  const { push, helper, indent, deindent, newline } = context;
  const { needPauseTracking, needArraySpread } = node;

  push(`_cache[${node.index}] || (`);
  push(`_cache[${node.index}] = `);
  genNode(node.value, context);
  push(`)`);
}

// JavaScript
function genCallExpression(node: CallExpression, context: CodegenContext) {
  const { push, helper, pure } = context;
  const callee = isString(node.callee) ? node.callee : helper(node.callee);
  if (pure) {
    push(PURE_ANNOTATION);
  }
  push(callee + `(`, NewlineType.None, node);
  genNodeList(node.arguments, context);
  push(`)`);
}

// 處理內容: v-for,
function genFunctionExpression(
  node: FunctionExpression,
  context: CodegenContext
) {
  const { push, indent, deindent } = context;
  const { params, returns, body, newline, isSlot } = node;

  push(`(`);

  if (isArray(params)) {
    genNodeList(params, context);
  } else if (params) {
    genNode(params, context);
  }

  push(`)=>`);

  if (newline || body) {
    push(`{`);
    indent();
  }

  if (returns) {
    if (newline) {
      push(`return `);
    }

    if (isArray(returns)) {
      genNodeListAsArray(returns, context);
    } else {
      genNode(returns, context);
    }
  }
  if (newline || body) {
    deindent();
    push(`}`);
  }
}

function genCompoundExpression(
  node: CompoundExpressionNode,
  context: CodegenContext,
) {
  for (let i = 0; i < node.children!.length; i++) {
    const child = node.children![i]
    if (isString(child)) {
      context.push(child, NewlineType.Unknown)
    } else {      
      genNode(child, context)
    }
  }
}

function genArrayExpression(node: ArrayExpression, context: CodegenContext) {
  genNodeListAsArray(node.elements as CodegenNode[], context)
}

function genNode(node: CodegenNode | symbol | string, context: CodegenContext) {
  if (isString(node)) {
    context.push(node, NewlineType.Unknown);
    return;
  }
  if (isSymbol(node)) {
    context.push(context.helper(node));
    return;
  }
  console.log('node', node);

  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.FOR:
      genNode(node.codegenNode!, context);
      break;
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    case NodeTypes.JS_OBJECT_EXPRESSION:
      genObjectExpression(node, context);
      break;
    case NodeTypes.JS_ARRAY_EXPRESSION:
      genArrayExpression(node, context)
      break
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context);
      break;
    case NodeTypes.JS_CALL_EXPRESSION:
      genCallExpression(node, context);
      break;
    case NodeTypes.JS_CACHE_EXPRESSION:
      genCacheExpression(node, context);
      break;
    case NodeTypes.JS_FUNCTION_EXPRESSION:
      genFunctionExpression(node, context);
      break;
    default:
      break;
  }
}

function genInterpolation(node: InterpolationNode, context: CodegenContext) {
  const { push, helper, pure } = context;
  if (pure) push(PURE_ANNOTATION);
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(`)`);
}
