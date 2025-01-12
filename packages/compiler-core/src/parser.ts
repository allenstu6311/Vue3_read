import Tokenizer, { isWhitespace, ParseMode } from "./tokenizer.js";
import { extend, NO } from "../../shared/src/general.js";
import { ConstantTypes, createRoot, createSimpleExpression, ElementNode, ElementTypes, Namespaces, NodeTypes, RootNode, SimpleExpressionNode, SourceLocation, TemplateChildNode } from "./ast.js";
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
let currentOpenTag: ElementNode | null = null
const stack: ElementNode[] = [];
let inPre = 0;

const tokenizer = new Tokenizer(stack, {
  ontext(start, end) {
    onText(getSlice(start, end), start, end)
  },
  ontextentity(char, start, end) { },
  oncomment(start, end) { },
  oninterpolation(start, end) {
    if (inPre) {
      return onText(getSlice(start, end), start, end)
    }
    let innerStart = start + tokenizer.delimiterOpen.length;
    let innerEnd = end - tokenizer.delimiterClose.length;

    while (isWhitespace(currentInput.charCodeAt(innerStart))) {
      innerStart++;
    }
    while (isWhitespace(currentInput.charCodeAt(innerEnd - 1))) {
      innerEnd--;
    }

    let exp = getSlice(innerStart, innerEnd);//{{ test }} => test

    addNode({
      type: NodeTypes.INTERPOLATION,
      content: createExp(exp, false, getLoc(innerStart, innerEnd)),
      loc: getLoc(start, end),
    })

  },
  onopentagname(start, end) { 
    const name = getSlice(start, end);
    currentOpenTag = {
      type: NodeTypes.ELEMENT,
      tag: name,
      ns: currentOptions.getNamespace(name, stack[0], currentOptions.ns),
      tagType: ElementTypes.ELEMENT, // will be refined on tag close
      props: [],
      children: [],
      loc: getLoc(start - 1, end),
      codegenNode: undefined,
    }
  },
  onopentagend(end) { },
  onclosetag(start, end) { },
  onattribend(quote, end) { },
  onattribentity(char, start, end) { },
  onattribname(start, end) { },
  onattribnameend(end) { },
  onattribdata(start, end) { },
  onselfclosingtag(end) { },
  ondirname(start, end) { },
  ondirarg(start, end) { },
  ondirmodifier(start, end) { },
  oncdata(start, end) { },
  onprocessinginstruction(start, end) { },
  onend() { },
  onerr(code, index) { },
});

/**
 * 處理純文本
 */
function onText(content: string, start: number, end: number) {
  const tag = stack[0] && stack[0].tag;
  // console.log('content', content);
  if (tag !== 'script' && tag !== 'style' && content.includes('&')) {
    content = currentOptions.decodeEntities!(content, false);
  }
}

function getSlice(start: number, end: number) {
  return currentInput.slice(start, end)
}

function addNode(node: TemplateChildNode) {
  (stack[0] || currentRoot).children.push(node)
}

function getLoc(start: number, end?: number): SourceLocation {
  return {
    start: tokenizer.getPos(start),
    // @ts-expect-error allow late attachment
    end: end == null ? end : tokenizer.getPos(end),
    // @ts-expect-error allow late attachment
    source: end == null ? end : getSlice(start, end),
  }
}

enum ExpParseMode {
  Normal,
  Params,
  Statements,
  Skip,
}

function createExp(
  content: SimpleExpressionNode['content'],
  isStatic: SimpleExpressionNode['isStatic'] = false,
  loc: SourceLocation,
  constType: ConstantTypes = ConstantTypes.NOT_CONSTANT,
  parseMode = ExpParseMode.Normal
){
  const exp = createSimpleExpression(content, isStatic, loc, constType);
  return exp
}

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
