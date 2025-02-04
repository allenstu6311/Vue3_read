import {
  ElementNode,
  JSChildNode,
  Namespace,
  Namespaces,
  RootNode,
  TemplateChildNode,
} from "./ast.js";
import { CompilerCompatOptions } from "./compact/compatConfig.js";
import {
  DirectiveTransform,
  NodeTransform,
  TransformContext,
} from "./transform.js";

export type CompilerOptions = TransformOptions;
export type CodegenResult = {
  code: string;
  preamble: string;
  ast: RootNode;
  map?: RawSourceMap;
};

export interface ErrorHandlingOptions {
  onWarn?: (warning: any) => void;
  onError?: (error: any) => void;
}
export interface ParserOptions
  extends ErrorHandlingOptions,
    CompilerCompatOptions {
  /**
   * Base mode is platform agnostic and only parses HTML-like template syntax,
   * treating all tags the same way. Specific tag parsing behavior can be
   * configured by higher-level compilers.
   *
   * HTML mode adds additional logic for handling special parsing behavior in
   * `<script>`, `<style>`,`<title>` and `<textarea>`.
   * The logic is handled inside compiler-core for efficiency.
   *
   * SFC mode treats content of all root-level tags except `<template>` as plain
   * text.
   */
  parseMode?: "base" | "html" | "sfc";
  /**
   * Specify the root namespace to use when parsing a template.
   * Defaults to `Namespaces.HTML` (0).
   */
  ns?: Namespaces;
  /**
   * e.g. platform native elements, e.g. `<div>` for browsers
   */
  isNativeTag?: (tag: string) => boolean;
  /**
   * e.g. native elements that can self-close, e.g. `<img>`, `<br>`, `<hr>`
   */
  isVoidTag?: (tag: string) => boolean;
  /**
   * e.g. elements that should preserve whitespace inside, e.g. `<pre>`
   */
  isPreTag?: (tag: string) => boolean;
  /**
   * Elements that should ignore the first newline token per parinsg spec
   * e.g. `<textarea>` and `<pre>`
   */
  isIgnoreNewlineTag?: (tag: string) => boolean;
  /**
   * Platform-specific built-in components e.g. `<Transition>`
   */
  isBuiltInComponent?: (tag: string) => symbol | void;
  /**
   * Separate option for end users to extend the native elements list
   */
  isCustomElement?: (tag: string) => boolean | void;
  /**
   * Get tag namespace
   */
  getNamespace?: (
    tag: string,
    parent: ElementNode | undefined,
    rootNamespace: Namespaces
  ) => Namespace;
  /**
   * @default ['{{', '}}']
   */
  delimiters?: [string, string];
  /**
   * Whitespace handling strategy
   * @default 'condense'
   */
  whitespace?: "preserve" | "condense";
  /**
   * Only used for DOM compilers that runs in the browser.
   * In non-browser builds, this option is ignored.
   */
  decodeEntities?: (rawText: string, asAttr: boolean) => string;
  /**
   * Whether to keep comments in the templates AST.
   * This defaults to `true` in development and `false` in production builds.
   */
  comments?: boolean;
  /**
   * Parse JavaScript expressions with Babel.
   * @default false
   */
  prefixIdentifiers?: boolean;
  /**
   * A list of parser plugins to enable for `@babel/parser`, which is used to
   * parse expressions in bindings and interpolations.
   * https://babeljs.io/docs/en/next/babel-parser#plugins
   */
  expressionPlugins?: any[];
}

export interface TransformOptions
  extends SharedTransformCodegenOptions,
    ErrorHandlingOptions,
    CompilerCompatOptions {
  /**
   * An array of node transforms to be applied to every AST node.
   */
  nodeTransforms?: NodeTransform[];
  /**
   * An object of { name: transform } to be applied to every directive attribute
   * node found on element nodes.
   */
  directiveTransforms?: Record<string, DirectiveTransform | undefined>;
  /**
   * An optional hook to transform a node being hoisted.
   * used by compiler-dom to turn hoisted nodes into stringified HTML vnodes.
   * @default null
   */
  transformHoist?: HoistTransform | null;
  /**
   * If the pairing runtime provides additional built-in elements, use this to
   * mark them as built-in so the compiler will generate component vnodes
   * for them.
   */
  isBuiltInComponent?: (tag: string) => symbol | void;
  /**
   * Used by some transforms that expects only native elements
   */
  isCustomElement?: (tag: string) => boolean | void;
  /**
   * Transform expressions like {{ foo }} to `_ctx.foo`.
   * If this option is false, the generated code will be wrapped in a
   * `with (this) { ... }` block.
   * - This is force-enabled in module mode, since modules are by default strict
   * and cannot use `with`
   * @default mode === 'module'
   */
  prefixIdentifiers?: boolean;
  /**
   * Cache static VNodes and props objects to `_hoisted_x` constants
   * @default false
   */
  hoistStatic?: boolean;
  /**
   * Cache v-on handlers to avoid creating new inline functions on each render,
   * also avoids the need for dynamically patching the handlers by wrapping it.
   * e.g `@click="foo"` by default is compiled to `{ onClick: foo }`. With this
   * option it's compiled to:
   * ```js
   * { onClick: _cache[0] || (_cache[0] = e => _ctx.foo(e)) }
   * ```
   * - Requires "prefixIdentifiers" to be enabled because it relies on scope
   * analysis to determine if a handler is safe to cache.
   * @default false
   */
  cacheHandlers?: boolean;
  /**
   * A list of parser plugins to enable for `@babel/parser`, which is used to
   * parse expressions in bindings and interpolations.
   * https://babeljs.io/docs/en/next/babel-parser#plugins
   */
  expressionPlugins?: any[];
  /**
   * SFC scoped styles ID
   */
  scopeId?: string | null;
  /**
   * Indicates this SFC template has used :slotted in its styles
   * Defaults to `true` for backwards compatibility - SFC tooling should set it
   * to `false` if no `:slotted` usage is detected in `<style>`
   */
  slotted?: boolean;
  /**
   * SFC `<style vars>` injection string
   * Should already be an object expression, e.g. `{ 'xxxx-color': color }`
   * needed to render inline CSS variables on component root
   */
  ssrCssVars?: string;
  /**
   * Whether to compile the template assuming it needs to handle HMR.
   * Some edge cases may need to generate different code for HMR to work
   * correctly, e.g. #6938, #7138
   */
  hmr?: boolean;
}

export type HoistTransform = (
  children: TemplateChildNode[],
  context: TransformContext,
  parent: ParentNode
) => void;

interface SharedTransformCodegenOptions {
  /**
   * Transform expressions like {{ foo }} to `_ctx.foo`.
   * If this option is false, the generated code will be wrapped in a
   * `with (this) { ... }` block.
   * - This is force-enabled in module mode, since modules are by default strict
   * and cannot use `with`
   * @default mode === 'module'
   */
  prefixIdentifiers?: boolean;
  /**
   * Control whether generate SSR-optimized render functions instead.
   * The resulting function must be attached to the component via the
   * `ssrRender` option instead of `render`.
   *
   * When compiler generates code for SSR's fallback branch, we need to set it to false:
   *  - context.ssr = false
   *
   * see `subTransform` in `ssrTransformComponent.ts`
   */
  ssr?: boolean;
  /**
   * Indicates whether the compiler generates code for SSR,
   * it is always true when generating code for SSR,
   * regardless of whether we are generating code for SSR's fallback branch,
   * this means that when the compiler generates code for SSR's fallback branch:
   *  - context.ssr = false
   *  - context.inSSR = true
   */
  inSSR?: boolean;
  /**
   * Optional binding metadata analyzed from script - used to optimize
   * binding access when `prefixIdentifiers` is enabled.
   */
  bindingMetadata?: BindingMetadata;
  /**
   * Compile the function for inlining inside setup().
   * This allows the function to directly access setup() local bindings.
   */
  inline?: boolean;
  /**
   * Indicates that transforms and codegen should try to output valid TS code
   */
  isTS?: boolean;
  /**
   * Filename for source map generation.
   * Also used for self-recursive reference in templates
   * @default 'template.vue.html'
   */
  filename?: string;
}

export enum BindingTypes {
  /**
   * returned from data()
   */
  DATA = "data",
  /**
   * declared as a prop
   */
  PROPS = "props",
  /**
   * a local alias of a `<script setup>` destructured prop.
   * the original is stored in __propsAliases of the bindingMetadata object.
   */
  PROPS_ALIASED = "props-aliased",
  /**
   * a let binding (may or may not be a ref)
   */
  SETUP_LET = "setup-let",
  /**
   * a const binding that can never be a ref.
   * these bindings don't need `unref()` calls when processed in inlined
   * template expressions.
   */
  SETUP_CONST = "setup-const",
  /**
   * a const binding that does not need `unref()`, but may be mutated.
   */
  SETUP_REACTIVE_CONST = "setup-reactive-const",
  /**
   * a const binding that may be a ref.
   */
  SETUP_MAYBE_REF = "setup-maybe-ref",
  /**
   * bindings that are guaranteed to be refs
   */
  SETUP_REF = "setup-ref",
  /**
   * declared by other options, e.g. computed, inject
   */
  OPTIONS = "options",
  /**
   * a literal constant, e.g. 'foo', 1, true
   */
  LITERAL_CONST = "literal-const",
}

export type BindingMetadata = {
  [key: string]: BindingTypes | undefined;
} & {
  __isScriptSetup?: boolean;
  __propsAliases?: Record<string, string>;
};

export interface CodegenOptions extends SharedTransformCodegenOptions {
  /**
   * - `module` mode will generate ES module import statements for helpers
   * and export the render function as the default export.
   * - `function` mode will generate a single `const { helpers... } = Vue`
   * statement and return the render function. It expects `Vue` to be globally
   * available (or passed by wrapping the code with an IIFE). It is meant to be
   * used with `new Function(code)()` to generate a render function at runtime.
   * @default 'function'
   */
  mode?: "module" | "function";
  /**
   * Generate source map?
   * @default false
   */
  sourceMap?: boolean;
  /**
   * SFC scoped styles ID
   */
  scopeId?: string | null;
  /**
   * Option to optimize helper import bindings via variable assignment
   * (only used for webpack code-split)
   * @default false
   */
  optimizeImports?: boolean;
  /**
   * Customize where to import runtime helpers from.
   * @default 'vue'
   */
  runtimeModuleName?: string;
  /**
   * Customize where to import ssr runtime helpers from/**
   * @default 'vue/server-renderer'
   */
  ssrRuntimeModuleName?: string;
  /**
   * Customize the global variable name of `Vue` to get helpers from
   * in function mode
   * @default 'Vue'
   */
  runtimeGlobalName?: string;
}

/**
 * The `SourceMapGenerator` type from `source-map-js` is a bit incomplete as it
 * misses `toJSON()`. We also need to add types for internal properties which we
 * need to access for better performance.
 *
 * Since TS 5.3, dts generation starts to strangely include broken triple slash
 * references for source-map-js, so we are inlining all source map related types
 * here to to workaround that.
 */
export interface CodegenSourceMapGenerator {
  setSourceContent(sourceFile: string, sourceContent: string): void;
  // SourceMapGenerator has this method but the types do not include it
  toJSON(): RawSourceMap;
  _sources: Set<string>;
  _names: Set<string>;
  _mappings: {
    add(mapping: MappingItem): void;
  };
}

interface MappingItem {
  source: string;
  generatedLine: number;
  generatedColumn: number;
  originalLine: number;
  originalColumn: number;
  name: string | null;
}

export interface RawSourceMap {
  file?: string;
  sourceRoot?: string;
  version: string;
  sources: string[];
  names: string[];
  sourcesContent?: string[];
  mappings: string;
}

export interface CodegenContext
  extends Omit<Required<CodegenOptions>, "bindingMetadata" | "inline"> {
  /**
   * 原始 `.vue` 文件的內容，用於生成代碼時參考。
   */
  source: string;

  /**
   * 目前累積的 JavaScript 代碼（最終 render() 會輸出這個變數）。
   */
  code: string;

  /**
   * 當前生成的代碼所在行號（用於格式化輸出和 source map 追蹤）。
   */
  line: number;

  /**
   * 當前代碼的列號，表示目前輸出的字符位置。
   */
  column: number;

  /**
   * 當前處理的字符在 `source` 內的偏移量（從 0 開始計算）。
   */
  offset: number;

  /**
   * 當前的縮排層級，用於控制輸出代碼的可讀性。
   */
  indentLevel: number;

  /**
   * 是否在 `/* @PURE * /` 模式下生成代碼，讓編譯器可以進一步優化。(提示壓縮工具用)
   */
  pure: boolean;

  /**
   * 來源映射（source map），用於追蹤輸出代碼對應的 `.vue` 文件位置。
   */
  map?: CodegenSourceMapGenerator;

  /**
   * 取得 Vue Runtime Helper，例如 `_createElementVNode`。
   * @param key Vue 編譯器內部的 symbol（例如 `CREATE_ELEMENT_VNODE`）。
   * @returns 轉換後的函數名稱，如 `_createElementVNode`。
   */
  helper(key: symbol): string;

  /**
   * 將代碼插入到 `code` 變數中。
   * @param code 要插入的 JavaScript 代碼。
   * @param newlineIndex 可選，換行的索引值（通常自動計算）。
   * @param node 可選，對應的 AST 節點（用於 source map）。
   */
  push(code: string, newlineIndex?: number, node?: CodegenNode): void;

  /**
   * 增加一層縮排，影響之後插入的代碼格式。
   */
  indent(): void;

  /**
   * 減少一層縮排。
   * @param withoutNewLine 是否不換行（預設為 `false`，會換行）。
   */
  deindent(withoutNewLine?: boolean): void;

  /**
   * 插入換行符，確保代碼可讀性。
   */
  newline(): void;
}

type CodegenNode = TemplateChildNode | JSChildNode;
