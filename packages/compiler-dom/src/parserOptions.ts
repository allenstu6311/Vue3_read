import { isVoidTag } from "../../shared/src/domTagConfig.js";
import { ParserOptions } from "../../compiler-core/src/options.js";

export const parserOptions: ParserOptions = {
  parseMode: "html",
  isVoidTag,
  isPreTag: (tag) => tag === "pre",
};
