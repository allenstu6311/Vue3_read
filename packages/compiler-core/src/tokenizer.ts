import { App } from "./../../runtime-core/src/compat/apiCreateApp";
import { Position } from "./ast";
export enum ParseMode {
  BASE,
  HTML,
  SFC,
}

export enum CharCodes {
  /** \t */
  Tab = 0x9,
  /** \n */
  NewLine = 0xa,
  /** \f */
  FormFeed = 0xc,
  /** \r */
  CarriageReturn = 0xd,
  /** " " */
  Space = 0x20,
  /** "!" */
  ExclamationMark = 0x21,
  /** "#" */
  Number = 0x23,
  /** "&" */
  Amp = 0x26,
  /** "'" */
  SingleQuote = 0x27,
  /** '"' */
  DoubleQuote = 0x22,
  /** "`" */
  GraveAccent = 96,
  /** "-" */
  Dash = 0x2d,
  /** "/" */
  Slash = 0x2f,
  /** "0" */
  Zero = 0x30,
  /** "9" */
  Nine = 0x39,
  /** ";" */
  Semi = 0x3b,
  /** "<" */
  Lt = 0x3c,
  /** "=" */
  Eq = 0x3d,
  /** ">" */
  Gt = 0x3e,
  /** "?" */
  Questionmark = 0x3f,
  /** "A" */
  UpperA = 0x41,
  /** "a" */
  LowerA = 0x61,
  /** "F" */
  UpperF = 0x46,
  /** "f" */
  LowerF = 0x66,
  /** "Z" */
  UpperZ = 0x5a,
  /** "z" */
  LowerZ = 0x7a,
  /** "x" */
  LowerX = 0x78,
  /** "v" */
  LowerV = 0x76,
  /** "." */
  Dot = 0x2e,
  /** ":" */
  Colon = 0x3a,
  /** "@" */
  At = 0x40,
  /** "[" */
  LeftSquare = 91,
  /** "]" */
  RightSquare = 93,
}

const defaultDelimitersOpen = new Uint8Array([123, 123]) // "{{"
const defaultDelimitersClose = new Uint8Array([125, 125]) // "}}"


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

export enum State {
  /** 
   * 文本状态，例如解析普通文本内容。
   * 示例：`Hello World`
   */
  Text = 1,

  // 插值相关
  /** 
   * 插值表达式的起始状态，解析 `{{`。
   * 示例：`{{name}}` 中的 `{{`
   */
  InterpolationOpen,
  /** 
   * 插值表达式的内容状态，解析表达式主体。
   * 示例：`{{name}}` 中的 `name`
   */
  Interpolation,
  /** 
   * 插值表达式的结束状态，解析 `}}`。
   * 示例：`{{name}}` 中的 `}}`
   */
  InterpolationClose,

  // 标签相关
  /** 
   * 标签名称之前的状态，例如 `<` 之后。
   * 示例：`<div>` 中的 `<`
   */
  BeforeTagName,
  /** 
   * 标签名称状态，解析标签名称。
   * 示例：`<div>` 中的 `div`
   */
  InTagName,
  /** 
   * 自闭合标签状态，例如 `/>`。
   * 示例：`<img />`
   */
  InSelfClosingTag,
  /** 
   * 闭合标签名称之前的状态。
   * 示例：`</div>` 中的 `</`
   */
  BeforeClosingTagName,
  /** 
   * 闭合标签名称状态，解析标签名称。
   * 示例：`</div>` 中的 `div`
   */
  InClosingTagName,
  /** 
   * 闭合标签名称之后的状态。
   * 示例：`</div>` 中的 `>`
   */
  AfterClosingTagName,

  // 属性相关
  /** 
   * 属性名称之前的状态。
   * 示例：`<div id="app">` 中的空格
   */
  BeforeAttrName,
  /** 
   * 属性名称状态。
   * 示例：`<div id="app">` 中的 `id`
   */
  InAttrName,
  /** 
   * 指令名称状态。
   * 示例：`<div v-model="name">` 中的 `v-model`
   */
  InDirName,
  /** 
   * 指令参数状态。
   * 示例：`<div :name="value">` 中的 `name`
   */
  InDirArg,
  /** 
   * 动态指令参数状态。
   * 示例：`<div :[name]="value">` 中的 `[name]`
   */
  InDirDynamicArg,
  /** 
   * 指令修饰符状态。
   * 示例：`<div v-model.trim="value">` 中的 `.trim`
   */
  InDirModifier,
  /** 
   * 属性名称之后的状态。
   * 示例：`<div id="app">` 中的 `=`
   */
  AfterAttrName,
  /** 
   * 属性值之前的状态。
   * 示例：`<div id="app">` 中的 `=`
   */
  BeforeAttrValue,
  /** 
   * 属性值双引号状态。
   * 示例：`<div id="app">` 中的 `"app"`
   */
  InAttrValueDq,
  /** 
   * 属性值单引号状态。
   * 示例：`<div id='app'>` 中的 `'app'`
   */
  InAttrValueSq,
  /** 
   * 无引号的属性值状态。
   * 示例：`<div id=app>` 中的 `app`
   */
  InAttrValueNq,

  // 声明相关
  /** 
   * 声明之前的状态，例如 `<!`。
   * 示例：`<!DOCTYPE html>` 中的 `<!`
   */
  BeforeDeclaration,
  /** 
   * 声明内容状态。
   * 示例：`<!DOCTYPE html>` 中的 `DOCTYPE html`
   */
  InDeclaration,

  // 处理指令相关
  /** 
   * 处理指令状态，例如 `<?`。
   * 示例：`<?xml version="1.0"?>` 中的 `<?`
   */
  InProcessingInstruction,

  // 注释与CDATA相关
  /** 
   * 注释开始之前的状态，例如 `<!--`。
   * 示例：`<!-- comment -->`
   */
  BeforeComment,
  /** 
   * CDATA序列状态。
   * 示例：`<![CDATA[<content>]]>` 中的 `<![CDATA[`
   */
  CDATASequence,
  /** 
   * 特殊注释状态。
   * 示例：`<!-- [if IE]> special <![endif] -->`
   */
  InSpecialComment,
  /** 
   * 注释内容状态。
   * 示例：`<!-- comment -->` 中的 `comment`
   */
  InCommentLike,

  // 特殊标签相关
  /** 
   * 判断是否为 `<script` 或 `<style` 标签的状态。
   * 示例：`<script>` 或 `<style>`
   */
  BeforeSpecialS,
  /** 
   * 判断是否为 `<title` 或 `<textarea` 标签的状态。
   * 示例：`<title>` 或 `<textarea>`
   */
  BeforeSpecialT,
  /** 
   * 特殊标签的起始序列状态。
   * 示例：`<script>` 中的 `<script`
   */
  SpecialStartSequence,
  /** 
   * RCDATA模式状态，用于解析内容。
   * 示例：`<textarea>` 标签中的内容
   */
  InRCDATA,

  // 实体相关
  /** 
   * HTML实体状态。
   * 示例：`&amp;` 中的 `&amp;`
   */
  InEntity,

  // SFC根标签相关
  /** 
   * SFC（单文件组件）根标签名称状态。
   * 示例：`<template>` 或 `<script>`
   */
  InSFCRootTagName,
}


export interface Callbacks {
  /**
   * 處理文本內容的回調。
   * @param start 文本開始的索引位置。
   * @param endIndex 文本結束的索引位置（不包括）。
   */
  ontext(start: number, endIndex: number): void;

  /**
   * 處理文本中的實體字符（如 `&amp;`）的回調。
   * @param char 實體轉換後的字符。
   * @param start 實體開始的索引位置。
   * @param endIndex 實體結束的索引位置（不包括）。
   */
  ontextentity(char: string, start: number, endIndex: number): void;

  /**
   * 處理插值表達式的回調。
   * @param start 插值開始的索引位置。
   * @param endIndex 插值結束的索引位置（不包括）。
   */
  oninterpolation(start: number, endIndex: number): void;

  /**
   * 處理開啟標籤名稱的回調。
   * @param start 標籤名稱開始的索引位置。
   * @param endIndex 標籤名稱結束的索引位置（不包括）。
   */
  onopentagname(start: number, endIndex: number): void;

  /**
   * 處理開啟標籤結束（`>`）的回調。
   * @param endIndex 標籤結束字符的索引位置。
   */
  onopentagend(endIndex: number): void;

  /**
   * 處理自閉合標籤的回調。
   * @param endIndex 自閉合標籤的結束索引位置。
   */
  onselfclosingtag(endIndex: number): void;

  /**
   * 處理閉合標籤的回調。
   * @param start 標籤名稱開始的索引位置。
   * @param endIndex 標籤名稱結束的索引位置（不包括）。
   */
  onclosetag(start: number, endIndex: number): void;

  /**
   * 處理屬性值的回調。
   * @param start 屬性值開始的索引位置。
   * @param endIndex 屬性值結束的索引位置（不包括）。
   */
  onattribdata(start: number, endIndex: number): void;

  /**
   * 處理屬性值中的實體字符（如 `&amp;`）的回調。
   * @param char 實體轉換後的字符。
   * @param start 實體開始的索引位置。
   * @param end 實體結束的索引位置（不包括）。
   */
  onattribentity(char: string, start: number, end: number): void;

  /**
   * 處理屬性值結束的回調。
   * @param quote 屬性值的引號類型（單引號或雙引號）。
   * @param endIndex 屬性值結束的索引位置。
   */
  onattribend(quote: QuoteType, endIndex: number): void;

  /**
   * 處理屬性名稱的回調。
   * @param start 屬性名稱開始的索引位置。
   * @param endIndex 屬性名稱結束的索引位置（不包括）。
   */
  onattribname(start: number, endIndex: number): void;

  /**
   * 處理屬性名稱結束的回調。
   * @param endIndex 屬性名稱結束的索引位置。
   */
  onattribnameend(endIndex: number): void;

  /**
   * 處理指令名稱的回調。
   * @param start 指令名稱開始的索引位置。
   * @param endIndex 指令名稱結束的索引位置（不包括）。
   */
  ondirname(start: number, endIndex: number): void;

  /**
   * 處理指令參數的回調。
   * @param start 指令參數開始的索引位置。
   * @param endIndex 指令參數結束的索引位置（不包括）。
   */
  ondirarg(start: number, endIndex: number): void;

  /**
   * 處理指令修飾符的回調。
   * @param start 指令修飾符開始的索引位置。
   * @param endIndex 指令修飾符結束的索引位置（不包括）。
   */
  ondirmodifier(start: number, endIndex: number): void;

  /**
   * 處理註釋內容的回調。
   * @param start 註釋內容開始的索引位置。
   * @param endIndex 註釋內容結束的索引位置（不包括）。
   */
  oncomment(start: number, endIndex: number): void;

  /**
   * 處理 CDATA 的回調。
   * @param start CDATA 開始的索引位置。
   * @param endIndex CDATA 結束的索引位置（不包括）。
   */
  oncdata(start: number, endIndex: number): void;

  /**
   * 處理處理指令的回調。
   * @param start 處理指令開始的索引位置。
   * @param endIndex 處理指令結束的索引位置（不包括）。
   */
  onprocessinginstruction(start: number, endIndex: number): void;

  /**
   * 處理結束的回調。
   */
  onend(): void;

  /**
   * 處理錯誤的回調。
   * @param code 錯誤碼或錯誤對象。
   * @param index 發生錯誤的位置索引。
   */
  onerr(code: any, index: number): void;
}

export function isWhitespace(c: number): boolean {
  return (
    c === CharCodes.Space ||
    c === CharCodes.NewLine ||
    c === CharCodes.Tab ||
    c === CharCodes.FormFeed ||
    c === CharCodes.CarriageReturn
  )
}

/**
 * HTML標籤文字在a-z A-Z範圍
 */
function isTagStartChar(c: number): boolean {
  return (
    (c >= CharCodes.LowerA && c <= CharCodes.LowerZ) ||
    (c >= CharCodes.UpperA && c <= CharCodes.UpperZ)
  )
}

/**
 * 當前位置是結束標籤或空白 "/" || ">"
 */
function isEndOfTagSection(c: number): boolean {
  return c === CharCodes.Slash || c === CharCodes.Gt || isWhitespace(c)
}




/**
 * 蒐集標籤中的標記
 * v-for, v-if, id....
 */
export default class Tokenizer {
  /**
   * 當前解析模式
   */
  public mode: ParseMode = ParseMode.BASE;
  /**
   * 臨時儲存內容的緩衝區
   */
  private buffer = ''
  /**
   * 編譯位置
   */
  private index = 0
  /**
   * 記錄換行位置
   */
  private newlines: number[] = []
  /**
   * 標記器目前所處的狀態
   */
  public state: State = State.Text
  /**
   * 目前讀到的標籤的開頭
   */
  public sectionStart = 0
  /**
   * in v-pre
   */
  public inVPre = false
  /**
   * "{{"
   */
  public delimiterOpen: Uint8Array = defaultDelimitersOpen
  /**
   * "}}"
   */
  public delimiterClose: Uint8Array = defaultDelimitersClose
  /**
   * 
   */
  private delimiterIndex = -1
  /**
   * 
   */
  public inRCDATA = false


  constructor(private readonly stack: any[], private readonly cbs: Callbacks) { }

  /**
   * 取得表達式開始與結束的位置不包含"{{}}"
   * @param index 代碼列號
   */
  public getPos(index: number): Position {
    let line = 1;
    let column = index + 1;
    for (let i = this.newlines.length - 1; i >= 0; i--) {
      const newlineIndex = this.newlines[i];
      if (index > newlineIndex) {
        line = i + 2;
        column = index - newlineIndex;
        break;
      }
    }
    return {
      column,
      line,
      offset: index
    }
  }

  private stateText(c: number): void {
    if (c === CharCodes.Lt) {
      if (this.index > this.sectionStart) {
        this.cbs.ontext(this.sectionStart, this.index);
      }
      this.state = State.BeforeTagName;
      this.sectionStart = this.index;

    } else if (!this.inVPre && c === this.delimiterOpen[0]) {
      this.state = State.InterpolationOpen;
      this.delimiterIndex = 0;
      this.stateInterpolationOpen(c)
    }
  }

  private stateInterpolationOpen(c: number): void {
    if (c === this.delimiterOpen[this.delimiterIndex]) { //c 是否為 "{{"
      if (this.delimiterIndex === this.delimiterOpen.length - 1) {
        const start = this.index + 1 - this.delimiterOpen.length;
        if (start > this.sectionStart) {
          this.cbs.ontext(this.sectionStart, start);
        }
        this.state = State.Interpolation;
        this.sectionStart = start;
      } else {
        this.delimiterIndex++;
      }

    } else {
      this.state = State.Text;
      this.stateText(c);
    }
  }

  private stateInterpolation(c: number): void {
    if (c === this.delimiterClose[0]) {
      this.state = State.InterpolationClose;
      this.delimiterIndex = 0;
      this.stateInterpolationClose(c)
    }
  }

  private stateInterpolationClose(c: number) {
    if (c === this.delimiterClose[this.delimiterIndex]) {// c === "{{"      
      if (this.delimiterIndex === this.delimiterClose.length - 1) {
        this.cbs.oninterpolation(this.sectionStart, this.index + 1)
        if (this.inRCDATA) {
          this.state = State.InRCDATA
        } else {
          this.state = State.Text;
        }
        this.sectionStart = this.index + 1
      } else {
        this.delimiterIndex++
      }
    } else {
      this.state = State.Interpolation
      this.stateInterpolation(c)
    }
  }

  private stateBeforeTagName(c: number): void {
    if (c === CharCodes.ExclamationMark) {

    } else if (c === CharCodes.Questionmark) {

    } else if (isTagStartChar(c)) {
      this.sectionStart = this.index;
      this.state = State.InTagName;
    } else if (c === CharCodes.Slash) {
      this.state = State.BeforeClosingTagName
    } else {
      // 應該是純文本
      this.state = State.Text
      this.stateText(c)
    }
  }

  private stateInTagName(c: number): void {
    if (isEndOfTagSection(c)) {
      this.handleTagName(c);
    }
  }

  private handleTagName(c: number) {
    this.cbs.onopentagname(this.sectionStart, this.index);
    this.sectionStart = -1;
    this.state = State.BeforeAttrName;
    this.stateBeforeAttrName(c)
  }

  private stateBeforeAttrName(c: number): void {

  }

  /**
   * 模板解析
   * @param input template
   */
  public parse(input: string): void {
    this.buffer = input;
    while (this.index < this.buffer.length) {
      const c = this.buffer.charCodeAt(this.index); //取得單個字符串
      // console.log('tag', this.buffer.charAt(this.index),'c',c);
      if (c === CharCodes.NewLine) {
        this.newlines.push(this.index)
      }
      switch (this.state) {
        case State.Text: {
          // 處理普通文本節點，將文本內容儲存或進一步解析
          this.stateText(c);
          break;
        }
        case State.InterpolationOpen: {
          // 處理插值語法的起始符號 "{{"，進入插值解析階段
          this.stateInterpolationOpen(c);
          break;
        }
        case State.Interpolation: {
          // 處理插值內容，例如變數名稱或表達式
          this.stateInterpolation(c);
          break;
        }
        case State.InterpolationClose: {
          // 處理插值語法的結束符號 "}}"，結束插值解析階段
          this.stateInterpolationClose(c);
          break;
        }
        case State.BeforeTagName: {
          // 處理 `<` 符號後的狀態，準備進入標籤名稱解析
          this.stateBeforeTagName(c);
          break;
        }
        case State.InTagName: {
          // 處理標籤名稱（如 `<div>` 中的 "div"），直到解析完整標籤名稱
          this.stateInTagName(c);
          break;
        }
      }

      this.index++;
    }
  }
}
