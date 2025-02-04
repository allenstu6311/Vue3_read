import { JSChildNode, RootNode, TemplateChildNode } from "./ast.js";
import { CodegenContext, CodegenOptions, CodegenResult } from "./options.js";
import { helperNameMap } from "./runtimeHelpers.js";

type CodegenNode = TemplateChildNode | JSChildNode;

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
    indent() {},
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

  return {
    ast,
    code: context.code,
    preamble: "",
  };
}

enum NewlineType {
  Start = 0,
  End = -1,
  None = -2,
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

function genNode(
  node: CodegenNode | symbol | string,
  context: CodegenContext
) {}
