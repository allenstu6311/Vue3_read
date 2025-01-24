import { RootNode } from "./ast.js";
import { CodegenContext, CodegenOptions, CodegenResult } from "./options.js";

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
  const context: CodegenContext | any = {
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
  };
  return context;
}

export function generate(
  ast: RootNode,
  options: CodegenOptions & {
    onContextCreated?: (context: CodegenContext) => void;
  } = {}
): CodegenResult {
  const context = createCodegenContext(ast, options);

  const isSetupInlined = false;

  return {
    ast,
    code: context.code,
    preamble: "",
  };
}
