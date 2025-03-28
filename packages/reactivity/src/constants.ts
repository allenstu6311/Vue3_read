// 依賴追蹤時的操作類型分類，用於精準紀錄使用者對 reactive 對象的存取方式
export enum TrackOpTypes {
  /**
   * 使用者存取屬性，例如：obj.foo 或 obj['foo']
   */
  GET = "get",
  /**
   * 使用者檢查屬性是否存在，例如：'foo' in obj
   */
  HAS = "has",
  /**
   * 使用者遍歷對象的鍵，例如：for...in、Object.keys(obj)
   */
  ITERATE = "iterate",
}

export enum ReactiveFlags {
  SKIP = "__v_skip",
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  IS_SHALLOW = "__v_isShallow",
  /**
   * 是否為代理對象
   */
  RAW = "__v_raw",
  IS_REF = "__v_isRef",
}
