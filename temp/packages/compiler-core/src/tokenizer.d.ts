export declare enum ParseMode {
    BASE = 0,
    HTML = 1,
    SFC = 2
}
export declare enum CharCodes {
    Tab = 9,// "\t"
    NewLine = 10,// "\n"
    FormFeed = 12,// "\f"
    CarriageReturn = 13,// "\r"
    Space = 32,// " "
    ExclamationMark = 33,// "!"
    Number = 35,// "#"
    Amp = 38,// "&"
    SingleQuote = 39,// "'"
    DoubleQuote = 34,// '"'
    GraveAccent = 96,// "`"
    Dash = 45,// "-"
    Slash = 47,// "/"
    Zero = 48,// "0"
    Nine = 57,// "9"
    Semi = 59,// ";"
    Lt = 60,// "<"
    Eq = 61,// "="
    Gt = 62,// ">"
    Questionmark = 63,// "?"
    UpperA = 65,// "A"
    LowerA = 97,// "a"
    UpperF = 70,// "F"
    LowerF = 102,// "f"
    UpperZ = 90,// "Z"
    LowerZ = 122,// "z"
    LowerX = 120,// "x"
    LowerV = 118,// "v"
    Dot = 46,// "."
    Colon = 58,// ":"
    At = 64,// "@"
    LeftSquare = 91,// "["
    RightSquare = 93
}
/**
 * 標籤屬性的引號類型
 */
export declare enum QuoteType {
    /**
     * 無值 <input disabled>
     */
    NoValue = 0,
    /**
     * 未引用的值 <input disabled=disabled>
     */
    Unquoted = 1,
    /**
     * 引號值 <input disabled='disabled'>
     */
    Single = 2,
    /**
     * 雙引號值 <input disabled="disabled">
     */
    Double = 3
}
export interface Callbacks {
    ontext(start: number, endIndex: number): void;
    ontextentity(char: string, start: number, endIndex: number): void;
    oninterpolation(start: number, endIndex: number): void;
    onopentagname(start: number, endIndex: number): void;
    onopentagend(endIndex: number): void;
    onselfclosingtag(endIndex: number): void;
    onclosetag(start: number, endIndex: number): void;
    onattribdata(start: number, endIndex: number): void;
    onattribentity(char: string, start: number, end: number): void;
    onattribend(quote: QuoteType, endIndex: number): void;
    onattribname(start: number, endIndex: number): void;
    onattribnameend(endIndex: number): void;
    ondirname(start: number, endIndex: number): void;
    ondirarg(start: number, endIndex: number): void;
    ondirmodifier(start: number, endIndex: number): void;
    oncomment(start: number, endIndex: number): void;
    oncdata(start: number, endIndex: number): void;
    onprocessinginstruction(start: number, endIndex: number): void;
    onend(): void;
    onerr(code: any, index: number): void;
}
/**
 * 蒐集標籤中的標記
 * v-for, v-if, id....
 */
export default class Tokenizer {
    private readonly stack;
    private readonly cbs;
    /**
     * 當前解析模式
     */
    mode: ParseMode;
    /**
     * 臨時儲存內容的緩衝區
     */
    private buffer;
    /**
     * 編譯位置
     */
    private index;
    constructor(stack: any[], cbs: Callbacks);
    /**
     * 模板解析
     * @param input
     */
    parse(input: string): void;
}
