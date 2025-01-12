import { RootNode } from "./ast.js";
import { ParserOptions } from "./options.js";
import { CompilerCompatOptions } from "./compact/compatConfig";
type OptionalOptions = "decodeEntities" | "whitespace" | "isNativeTag" | "isBuiltInComponent" | "expressionPlugins" | keyof CompilerCompatOptions;
export type MergedParserOptions = Omit<Required<ParserOptions>, OptionalOptions> & Pick<ParserOptions, OptionalOptions>;
export declare const defaultParserOptions: MergedParserOptions;
/**
 *
 * @param input template
 * @param options
 * @returns
 */
export declare function baseParse(input: string, options?: ParserOptions): RootNode;
export {};
