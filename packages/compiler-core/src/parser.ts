import { extend, NO } from "../../shared/src/general.js";
import { Namespaces, RootNode } from "./ast.js";
import { ParserOptions } from "./options.js";

export type MergedParserOptions = {};

export const defaultParserOptions: MergedParserOptions = {
  parseMode: "base",
  ns: Namespaces.HTML,
  delimiters: [`{{`, `}}`],
  getNamespace: () => Namespaces.HTML,
  isVoidTag: NO,
  isPreTag: NO,
  isIgnoreNewlineTag: NO,
  isCustomElement: NO,
  // onError: defaultOnError,
  // onWarn: defaultOnWarn,
  // comments: __DEV__,
  prefixIdentifiers: false,
};

// parser state
let currentInput = "";
let currentOptions: MergedParserOptions = defaultParserOptions;

export function baseParse(input: string, options?: ParserOptions): RootNode {
  currentInput = input;
  currentOptions = extend({}, defaultParserOptions);

  return null as any;
}
