import Tokenizer, {
  CharCodes,
  isWhitespace,
  ParseMode,
  QuoteType,
} from "./tokenizer.js";
import { extend, NO } from "../../shared/src/general.js";
import {
  AttributeNode,
  ConstantTypes,
  createRoot,
  createSimpleExpression,
  DirectiveNode,
  ElementNode,
  ElementTypes,
  Namespaces,
  NodeTypes,
  RootNode,
  SimpleExpressionNode,
  SourceLocation,
  TemplateChildNode,
} from "./ast.js";
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
let currentOpenTag: ElementNode | null = null;
let currentProp: AttributeNode | DirectiveNode | null = null;
let currentAttrValue = "";
let currentAttrStartIndex = -1;
let currentAttrEndIndex = -1;
const stack: ElementNode[] = [];
let inPre = 0;
let inVPre = false;

const tokenizer = new Tokenizer(stack, {
  ontext(start, end) {
    onText(getSlice(start, end), start, end);
  },
  ontextentity(char, start, end) {},
  oncomment(start, end) {},
  oninterpolation(start, end) {
    if (inPre) {
      return onText(getSlice(start, end), start, end);
    }
    let innerStart = start + tokenizer.delimiterOpen.length;
    let innerEnd = end - tokenizer.delimiterClose.length;

    while (isWhitespace(currentInput.charCodeAt(innerStart))) {
      innerStart++;
    }
    while (isWhitespace(currentInput.charCodeAt(innerEnd - 1))) {
      innerEnd--;
    }

    let exp = getSlice(innerStart, innerEnd); //{{ test }} => test

    addNode({
      type: NodeTypes.INTERPOLATION,
      content: createExp(exp, false, getLoc(innerStart, innerEnd)),
      loc: getLoc(start, end),
    });
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
    };
  },
  onopentagend(end) {
    endOpenTag(end);
  },
  onclosetag(start, end) {
    const name = getSlice(start, end); //</div>=>div
    if (!currentOptions.isVoidTag(name)) {
      let found = false;

      for (let i = 0; i < stack.length; i++) {
        const e = stack[i];
        if (e.tag.toLowerCase() === name.toLowerCase()) {
          found = true;
          for (let j = 0; j <= i; j++) {
            const el = stack.shift()!;
            onCloseTag(el, end, j < i);
          }
          break;
        }
      }
      if (!found) {
        console.log("沒找到結尾標籤");
      }
    }
  },
  onattribend(quote, end) {
    if (currentOpenTag && currentProp) {
      setLocEnd(currentProp.loc, end); //紀錄最後位置

      if (quote !== QuoteType.NoValue) {
        if (currentProp.type === NodeTypes.ATTRIBUTE) {
          if (currentProp.name === "class") {
            currentAttrValue = condense(currentAttrValue).trim();
          }

          currentProp!.value = {
            type: NodeTypes.TEXT,
            content: currentAttrValue,
            loc:
              quote === QuoteType.Unquoted
                ? getLoc(currentAttrStartIndex, currentAttrEndIndex)
                : getLoc(currentAttrStartIndex - 1, currentAttrEndIndex + 1),
          };
        } else {
          // directive
          let expParseMode = ExpParseMode.Normal;
          currentProp.exp = createExp(
            currentAttrValue,
            false,
            getLoc(currentAttrStartIndex, currentAttrEndIndex),
            ConstantTypes.NOT_CONSTANT,
            expParseMode
          );
        }
      }

      if (
        currentProp.type !== NodeTypes.DIRECTIVE ||
        currentProp.name !== "pre"
      ) {
        currentOpenTag.props.push(currentProp);
      }

      currentAttrValue = "";
      currentAttrStartIndex = currentAttrEndIndex = -1;
    }
  },
  onattribentity(char, start, end) {},
  onattribname(start, end) {
    // plain attribute
    currentProp = {
      type: NodeTypes.ATTRIBUTE,
      name: getSlice(start, end), //class, id...
      nameLoc: getLoc(start, end),
      value: undefined,
      loc: getLoc(start),
    };
  },
  onattribnameend(end) {
    const start = currentProp!.loc.start.offset;
    const name = getSlice(start, end); // class, id, @click

    if (currentProp?.type === NodeTypes.DIRECTIVE) {
      currentProp.rawName = name;
    }
  },
  onattribdata(start, end) {
    currentAttrValue += getSlice(start, end); // class="name"=> name
    if (currentAttrStartIndex < 0) currentAttrStartIndex = start;
    currentAttrEndIndex = end;
  },
  onselfclosingtag(end) {},
  ondirname(start, end) {
    const raw = getSlice(start, end);
    const name =
      raw === "." || raw === ":"
        ? "bind"
        : raw === "@"
        ? "on"
        : raw === "#"
        ? "slot"
        : raw.slice(2);
    if (inVPre || name === "") {
    } else {
      currentProp = {
        type: NodeTypes.DIRECTIVE,
        name,
        rawName: raw,
        exp: undefined,
        arg: undefined,
        modifiers: raw === "." ? [createSimpleExpression("prop")] : [],
        loc: getLoc(start),
      };
    }
  },
  ondirarg(start, end) {
    if (start === end) return;
    const arg = getSlice(start, end); //click, input

    if (inVPre) {
    } else {
      const isStatic = arg[0] !== `[`;

      (currentProp as DirectiveNode).arg = createExp(
        isStatic ? arg : arg.slice(1, -1),
        isStatic,
        getLoc(start, end),
        isStatic ? ConstantTypes.CAN_STRINGIFY : ConstantTypes.NOT_CONSTANT
      );
    }
  },
  ondirmodifier(start, end) {},
  oncdata(start, end) {},
  onprocessinginstruction(start, end) {},
  onend() {},
  onerr(code, index) {},
});

/**
 * 處理純文本
 */
function onText(content: string, start: number, end: number) {
  const tag = stack[0] && stack[0].tag;
  // console.log('content', content);
  if (tag !== "script" && tag !== "style" && content.includes("&")) {
    content = currentOptions.decodeEntities!(content, false);
  }

  const parent = stack[0] || currentRoot;
  parent.children.push({
    type: NodeTypes.TEXT,
    content,
    loc: getLoc(start, end),
  });
}

function getSlice(start: number, end: number) {
  return currentInput.slice(start, end);
}

function addNode(node: TemplateChildNode) {
  (stack[0] || currentRoot).children.push(node);
  // console.log("currentRoot", currentRoot);
}

function getLoc(start: number, end?: number): SourceLocation {
  return {
    start: tokenizer.getPos(start),
    // @ts-expect-error allow late attachment
    end: end == null ? end : tokenizer.getPos(end),
    // @ts-expect-error allow late attachment
    source: end == null ? end : getSlice(start, end),
  };
}

/**
 * 設置結尾index
 * @param loc
 * @param end
 */
function setLocEnd(loc: SourceLocation, end: number) {
  loc.end = tokenizer.getPos(end);
  loc.source = getSlice(loc.start.offset, end);
}
/**
 * 清除文字多餘的空白，確保輸出格式標準
 */
function condense(str: string) {
  let ret = "";
  let prevCharIsWhitespace = false;

  for (let i = 0; i < str.length; i++) {
    if (isWhitespace(str.charCodeAt(i))) {
      if (!prevCharIsWhitespace) {
        ret += " ";
        prevCharIsWhitespace = true;
      }
    } else {
      ret += str[i];
      prevCharIsWhitespace = false;
    }
  }
  return ret;
}

/**
 * 處理結尾標籤(不影響最後結果渲染)
 * @param isImplied 是否為隱式閉合 <p>test(沒有結尾標籤)
 */
function onCloseTag(el: ElementNode, end: number, isImplied = false) {
  if (isImplied) {
    // implied close, end should be backtracked to close
    // setLocEnd(el.loc, backTrack(end, CharCodes.Lt))
  } else {
    setLocEnd(el.loc, lookAhead(end, CharCodes.Gt) + 1);
  }
}

function lookAhead(index: number, c: number) {
  let i = index;
  while (currentInput.charCodeAt(i) !== c && i < currentInput.length - 1) i++;
  return i;
}

enum ExpParseMode {
  Normal,
  Params,
  Statements,
  Skip,
}

function createExp(
  content: SimpleExpressionNode["content"],
  isStatic: SimpleExpressionNode["isStatic"] = false,
  loc: SourceLocation,
  constType: ConstantTypes = ConstantTypes.NOT_CONSTANT,
  parseMode = ExpParseMode.Normal
) {
  const exp = createSimpleExpression(content, isStatic, loc, constType);
  return exp;
}

function endOpenTag(end: number) {
  addNode(currentOpenTag!);
  const { tag, ns } = currentOpenTag!;

  if (ns === Namespaces.HTML && currentOptions.isPreTag(tag)) {
  }

  if (currentOptions.isVoidTag(tag)) {
  } else {
    stack.unshift(currentOpenTag!);
  }
  currentOpenTag = null;
}

/**
 * 全部都是空白
 */
function isAllWhitespace(str: string) {
  for (let i = 0; i < str.length; i++) {
    if (!isWhitespace(str.charCodeAt(i))) {
      return false;
    }
  }
  return true;
}

function hasNewlineChar(str: string) {
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c === CharCodes.NewLine || c === CharCodes.CarriageReturn) {
      return true;
    }
  }
  return false;
}

const windowsNewlineRE = /\r\n/g;
/**
 * 消除模板中的空白段落
 * @param nodes
 * @param tag
 * @returns
 */
function condenseWhitespace(
  nodes: TemplateChildNode[],
  tag?: string
): TemplateChildNode[] {
  const shouldCondense = currentOptions.whitespace !== "preserve";
  let removedWhitespace = false;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type === NodeTypes.TEXT) {
      if (!inPre) {
        if (isAllWhitespace(node.content)) {
          const prev = nodes[i - 1] && nodes[i - 1].type;
          const next = nodes[i + 1] && nodes[i + 1].type;

          if (
            !prev ||
            !next ||
            (shouldCondense &&
              ((prev === NodeTypes.COMMENT &&
                (next === NodeTypes.COMMENT || next === NodeTypes.ELEMENT)) ||
                (prev === NodeTypes.ELEMENT &&
                  (next === NodeTypes.COMMENT ||
                    (next === NodeTypes.ELEMENT &&
                      hasNewlineChar(node.content))))))
          ) {
            removedWhitespace = true;
            nodes[i] = null as any;
          } else {
            // Otherwise, the whitespace is condensed into a single space
            node.content = " ";
          }
        }
      } else {
        node.content = node.content.replace(windowsNewlineRE, "\n");
      }
    }
  }

  return removedWhitespace ? nodes.filter(Boolean) : nodes;
}

/**
 * 解析ast樹
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
  root.loc = getLoc(0, input.length);
  root.children = condenseWhitespace(root.children);
  return root;
}
