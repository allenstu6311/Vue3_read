import Tokenizer, { ParseMode } from "./tokenizer.js";
import { extend, NO } from "../../shared/src/general.js";
import { createRoot, Namespaces } from "./ast.js";
import { defaultOnError, defaultOnWarn } from "./errors.js";
export const defaultParserOptions = {
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
let currentOptions = defaultParserOptions;
let currentRoot = null;
const stack = [];
const tokenizer = new Tokenizer(stack, {
    ontext(start, end) { },
    ontextentity(char, start, end) { },
    oncomment(start, end) { },
    oninterpolation(start, end) { },
    onopentagname(start, end) { },
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
 *
 * @param input template
 * @param options
 * @returns
 */
export function baseParse(input, options) {
    currentInput = input;
    currentOptions = extend({}, defaultParserOptions);
    if (options) {
        let key;
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
    return null;
}
