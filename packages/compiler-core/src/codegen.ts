import { isString, isSymbol } from "../../shared/src/general.js";
import {
  ExpressionNode,
  JSChildNode,
  NodeTypes,
  ObjectExpression,
  RootNode,
  SimpleExpressionNode,
  TemplateChildNode,
  VNodeCall,
} from "./ast.js";
import { CodegenContext, CodegenOptions, CodegenResult } from "./options.js";
import { helperNameMap } from "./runtimeHelpers.js";
import { isSimpleIdentifier } from "./utils.js";

type CodegenNode = TemplateChildNode | JSChildNode;
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
    deindent() {},
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

  const helpers = Array.from(ast.helpers);
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
  console.log(context.code);

  if (ast.codegenNode) {
    genNode(ast.codegenNode, context);
  } else {
    push(`null`);
  }

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

function genObjectExpression(node: ObjectExpression, context: CodegenContext) {
  const { push, indent, deindent, newline } = context;
  const { properties } = node;
  if (!properties.length) {
    push(`{}`, NewlineType.None, node);
    return;
  }
  const multilines = properties.length > 1;

  push(multilines ? `{` : `{ `);

  for (let i = 0; i < properties.length; i++) {
    const { key, value } = properties[i];
    //key
    genExpressionAsPropertyKey(key, context);
    push(":");
    // value
    genNode(value, context);
    if (i < properties.length - 1) {
      // will only reach this if it's multilines
      push(`,`);
      newline();
    }
  }
  push(multilines ? `}` : ` }`);
}

function genExpression(node: SimpleExpressionNode, context: CodegenContext) {
  const { content, isStatic } = node;
  context.push(
    isStatic ? JSON.stringify(content) : content,
    NewlineType.Unknown,
    node
  );
}

function genVNodeCall(node: VNodeCall, context: CodegenContext) {}

function genNode(node: CodegenNode | symbol | string, context: CodegenContext) {
  if (isString(node)) {
    context.push(node, NewlineType.Unknown);
    return;
  }
  if (isSymbol(node)) {
    context.push(context.helper(node));
    return;
  }
  console.log("node", node);

  switch (node.type) {
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.JS_OBJECT_EXPRESSION:
      genObjectExpression(node, context);
      break;
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context);
      break;
    default:
      break;
  }
}
