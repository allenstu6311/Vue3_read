import Tokenizer, { ParseMode } from "./tokenizer.js";
import { extend, NO } from "../../shared/src/general.js";
import { createRoot, ElementNode, Namespaces, RootNode } from "./ast.js";
import { ParserOptions } from "./options.js";
import { CompilerCompatOptions } from "./compact/compatConfig";
import { defaultOnError, defaultOnWarn } from "./errors.js";

type OptionalOptions =
  | "decodeEntities"
  | "whitespace"
  | "isNativeTag"
  | "isBuiltInComponent"
  | "expressionPlugins"
  | keyof CompilerCompatOptions;

export type MergedParserOptions = Omit<
  Required<ParserOptions>,
  OptionalOptions
> &
  Pick<ParserOptions, OptionalOptions>;

export const defaultParserOptions: MergedParserOptions = {
  parseMode: "base",
  ns: Namespaces.HTML,
  delimiters: [`{{`, `}}`],
  getNamespace: () => Namespaces.HTML,
  isVoidTag: NO,
  isPreTag: NO,
  isIgnoreNewlineTag: NO,
  isCustomElement: NO,
  onError: defaultOnError,
  onWarn: defaultOnWarn,
  comments: false,
  prefixIdentifiers: false,
};

// parser state
let currentInput = "";
let currentOptions: MergedParserOptions = defaultParserOptions;
let currentRoot: RootNode | null = null;

const stack: ElementNode[] = [];

const tokenizer = new Tokenizer(stack, {
  ontext(start, end) {},
  ontextentity(char, start, end) {},
  oncomment(start, end) {},
  oninterpolation(start, end) {},
  onopentagname(start, end) {},
  onopentagend(end) {},
  onclosetag(start, end) {},
  onattribend(quote, end) {},
  onattribentity(char, start, end) {},
  onattribname(start, end) {},
  onattribnameend(end) {},
  onattribdata(start, end) {},
  onselfclosingtag(end) {},
  ondirname(start, end) {},
  ondirarg(start, end) {},
  ondirmodifier(start, end) {},
  oncdata(start, end) {},
  onprocessinginstruction(start, end) {},
  onend() {},
  onerr(code, index) {},
});

/**
 *
 * @param input template
 * @param options
 * @returns
 */
export function baseParse(input: string, options?: ParserOptions): RootNode {
  currentInput = input;
  currentOptions = extend({}, defaultParserOptions);

  if (options) {
    let key: keyof ParserOptions;
    for (key in options) {
      // @ts-expect-error
      currentOptions[key] = options[key];
    }
  }

  tokenizer.mode =
    currentOptions.parseMode === "html"
      ? ParseMode.HTML
      : currentOptions.parseMode === "sfc"
      ? ParseMode.SFC
      : ParseMode.BASE;

  const root = (currentRoot = createRoot([], input));
  tokenizer.parse(currentInput);
  return null as any;
}
