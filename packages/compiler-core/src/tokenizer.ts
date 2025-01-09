import { App } from "./../../runtime-core/src/compat/apiCreateApp";
export enum ParseMode {
  BASE,
  HTML,
  SFC,
}

/**
 * 標籤屬性的引號類型
 */
export enum QuoteType {
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
  Double = 3,
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
  // ondeclaration(start: number, endIndex: number): void
  onend(): void;
  onerr(code: any, index: number): void;
}

/**
 * 蒐集標籤中的標記
 * v-for, v-if, id....
 */
export default class Tokenizer {
  public mode: ParseMode = ParseMode.BASE;

  constructor(private readonly stack: any[], private readonly cbs: Callbacks) {}

  /**
   * 模板解析
   * @param input
   */
  public parse(input: string): void {}
}
