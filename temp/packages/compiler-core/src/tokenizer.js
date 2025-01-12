export var ParseMode;
(function (ParseMode) {
    ParseMode[ParseMode["BASE"] = 0] = "BASE";
    ParseMode[ParseMode["HTML"] = 1] = "HTML";
    ParseMode[ParseMode["SFC"] = 2] = "SFC";
})(ParseMode || (ParseMode = {}));
export var CharCodes;
(function (CharCodes) {
    CharCodes[CharCodes["Tab"] = 9] = "Tab";
    CharCodes[CharCodes["NewLine"] = 10] = "NewLine";
    CharCodes[CharCodes["FormFeed"] = 12] = "FormFeed";
    CharCodes[CharCodes["CarriageReturn"] = 13] = "CarriageReturn";
    CharCodes[CharCodes["Space"] = 32] = "Space";
    CharCodes[CharCodes["ExclamationMark"] = 33] = "ExclamationMark";
    CharCodes[CharCodes["Number"] = 35] = "Number";
    CharCodes[CharCodes["Amp"] = 38] = "Amp";
    CharCodes[CharCodes["SingleQuote"] = 39] = "SingleQuote";
    CharCodes[CharCodes["DoubleQuote"] = 34] = "DoubleQuote";
    CharCodes[CharCodes["GraveAccent"] = 96] = "GraveAccent";
    CharCodes[CharCodes["Dash"] = 45] = "Dash";
    CharCodes[CharCodes["Slash"] = 47] = "Slash";
    CharCodes[CharCodes["Zero"] = 48] = "Zero";
    CharCodes[CharCodes["Nine"] = 57] = "Nine";
    CharCodes[CharCodes["Semi"] = 59] = "Semi";
    CharCodes[CharCodes["Lt"] = 60] = "Lt";
    CharCodes[CharCodes["Eq"] = 61] = "Eq";
    CharCodes[CharCodes["Gt"] = 62] = "Gt";
    CharCodes[CharCodes["Questionmark"] = 63] = "Questionmark";
    CharCodes[CharCodes["UpperA"] = 65] = "UpperA";
    CharCodes[CharCodes["LowerA"] = 97] = "LowerA";
    CharCodes[CharCodes["UpperF"] = 70] = "UpperF";
    CharCodes[CharCodes["LowerF"] = 102] = "LowerF";
    CharCodes[CharCodes["UpperZ"] = 90] = "UpperZ";
    CharCodes[CharCodes["LowerZ"] = 122] = "LowerZ";
    CharCodes[CharCodes["LowerX"] = 120] = "LowerX";
    CharCodes[CharCodes["LowerV"] = 118] = "LowerV";
    CharCodes[CharCodes["Dot"] = 46] = "Dot";
    CharCodes[CharCodes["Colon"] = 58] = "Colon";
    CharCodes[CharCodes["At"] = 64] = "At";
    CharCodes[CharCodes["LeftSquare"] = 91] = "LeftSquare";
    CharCodes[CharCodes["RightSquare"] = 93] = "RightSquare";
})(CharCodes || (CharCodes = {}));
/**
 * 標籤屬性的引號類型
 */
export var QuoteType;
(function (QuoteType) {
    /**
     * 無值 <input disabled>
     */
    QuoteType[QuoteType["NoValue"] = 0] = "NoValue";
    /**
     * 未引用的值 <input disabled=disabled>
     */
    QuoteType[QuoteType["Unquoted"] = 1] = "Unquoted";
    /**
     * 引號值 <input disabled='disabled'>
     */
    QuoteType[QuoteType["Single"] = 2] = "Single";
    /**
     * 雙引號值 <input disabled="disabled">
     */
    QuoteType[QuoteType["Double"] = 3] = "Double";
})(QuoteType || (QuoteType = {}));
/**
 * 蒐集標籤中的標記
 * v-for, v-if, id....
 */
export default class Tokenizer {
    constructor(stack, cbs) {
        this.stack = stack;
        this.cbs = cbs;
        /**
         * 當前解析模式
         */
        this.mode = ParseMode.BASE;
        /**
         * 臨時儲存內容的緩衝區
         */
        this.buffer = '';
        /**
         * 編譯位置
         */
        this.index = 0;
    }
    /**
     * 模板解析
     * @param input
     */
    parse(input) {
        this.buffer = input;
        while (this.index < this.buffer.length) {
            const c = this.buffer.charAt(this.index); //取的字符串的Unicode 
            if (c === CharCodes.NewLine) {
            }
        }
    }
}
