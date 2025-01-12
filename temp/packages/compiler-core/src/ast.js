export var NodeTypes;
(function (NodeTypes) {
    NodeTypes[NodeTypes["ROOT"] = 0] = "ROOT";
    NodeTypes[NodeTypes["ELEMENT"] = 1] = "ELEMENT";
    NodeTypes[NodeTypes["TEXT"] = 2] = "TEXT";
    NodeTypes[NodeTypes["COMMENT"] = 3] = "COMMENT";
    NodeTypes[NodeTypes["SIMPLE_EXPRESSION"] = 4] = "SIMPLE_EXPRESSION";
    NodeTypes[NodeTypes["INTERPOLATION"] = 5] = "INTERPOLATION";
    NodeTypes[NodeTypes["ATTRIBUTE"] = 6] = "ATTRIBUTE";
    NodeTypes[NodeTypes["DIRECTIVE"] = 7] = "DIRECTIVE";
    // containers
    NodeTypes[NodeTypes["COMPOUND_EXPRESSION"] = 8] = "COMPOUND_EXPRESSION";
    NodeTypes[NodeTypes["IF"] = 9] = "IF";
    NodeTypes[NodeTypes["IF_BRANCH"] = 10] = "IF_BRANCH";
    NodeTypes[NodeTypes["FOR"] = 11] = "FOR";
    NodeTypes[NodeTypes["TEXT_CALL"] = 12] = "TEXT_CALL";
    // codegen
    NodeTypes[NodeTypes["VNODE_CALL"] = 13] = "VNODE_CALL";
    NodeTypes[NodeTypes["JS_CALL_EXPRESSION"] = 14] = "JS_CALL_EXPRESSION";
    NodeTypes[NodeTypes["JS_OBJECT_EXPRESSION"] = 15] = "JS_OBJECT_EXPRESSION";
    NodeTypes[NodeTypes["JS_PROPERTY"] = 16] = "JS_PROPERTY";
    NodeTypes[NodeTypes["JS_ARRAY_EXPRESSION"] = 17] = "JS_ARRAY_EXPRESSION";
    NodeTypes[NodeTypes["JS_FUNCTION_EXPRESSION"] = 18] = "JS_FUNCTION_EXPRESSION";
    NodeTypes[NodeTypes["JS_CONDITIONAL_EXPRESSION"] = 19] = "JS_CONDITIONAL_EXPRESSION";
    NodeTypes[NodeTypes["JS_CACHE_EXPRESSION"] = 20] = "JS_CACHE_EXPRESSION";
    // ssr codegen
    NodeTypes[NodeTypes["JS_BLOCK_STATEMENT"] = 21] = "JS_BLOCK_STATEMENT";
    NodeTypes[NodeTypes["JS_TEMPLATE_LITERAL"] = 22] = "JS_TEMPLATE_LITERAL";
    NodeTypes[NodeTypes["JS_IF_STATEMENT"] = 23] = "JS_IF_STATEMENT";
    NodeTypes[NodeTypes["JS_ASSIGNMENT_EXPRESSION"] = 24] = "JS_ASSIGNMENT_EXPRESSION";
    NodeTypes[NodeTypes["JS_SEQUENCE_EXPRESSION"] = 25] = "JS_SEQUENCE_EXPRESSION";
    NodeTypes[NodeTypes["JS_RETURN_STATEMENT"] = 26] = "JS_RETURN_STATEMENT";
})(NodeTypes || (NodeTypes = {}));
export var Namespaces;
(function (Namespaces) {
    Namespaces[Namespaces["HTML"] = 0] = "HTML";
    Namespaces[Namespaces["SVG"] = 1] = "SVG";
    Namespaces[Namespaces["MATH_ML"] = 2] = "MATH_ML";
})(Namespaces || (Namespaces = {}));
export const locStub = {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 },
    source: "",
};
export function createRoot(children, source = "") {
    return {
        type: NodeTypes.ROOT,
        source,
        children,
        helpers: new Set(),
        components: [],
        directives: [],
        hoists: [],
        imports: [],
        cached: [],
        temps: 0,
        codegenNode: undefined,
        loc: locStub,
    };
}
