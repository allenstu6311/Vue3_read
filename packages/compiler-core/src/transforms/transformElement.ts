import { isOn, isSymbol } from "../../../shared/src/general.js";
import { PatchFlags } from "../../../shared/src/patchFlags.js";
import {
  ArrayExpression,
  CallExpression,
  ConstantTypes,
  createArrayExpression,
  createCallExpression,
  createObjectExpression,
  createObjectProperty,
  createSimpleExpression,
  createVNodeCall,
  DirectiveArguments,
  DirectiveNode,
  ElementNode,
  ElementTypes,
  ExpressionNode,
  NodeTypes,
  ObjectExpression,
  Property,
  TemplateTextChildNode,
  VNodeCall,
} from "../ast.js";
import { NORMALIZE_CLASS, TELEPORT } from "../runtimeHelpers.js";
import { NodeTransform, TransformContext } from "../transform.js";
import { isStaticExp } from "../utils.js";
import { getConstantType } from "./cacheStatic.js";

// some directive transforms (e.g. v-model) may return a symbol for runtime
// import, which should be used instead of a resolveDirective call.
const directiveImportMap = new WeakMap<DirectiveNode, symbol>();

/**
 * 轉換 AST 中的元素節點，生成對應的 VNode 代碼。
 * - 處理標籤 (靜態/動態)
 * - 處理屬性 (props, directives)
 * - 處理子節點 (slots, children)
 * - 設定 patchFlag 以優化渲染更新
 */
export const transformElement: NodeTransform = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode!;

    if (
      !(
        node.type === NodeTypes.ELEMENT &&
        (node.tagType === ElementTypes.ELEMENT ||
          node.tagType === ElementTypes.COMPONENT)
      )
    ) {
      return;
    }

    const { tag, props } = node;
    const isComponent = node.tagType === ElementTypes.COMPONENT;

    let vnodeTag = `"${tag}"` as any;
    const isDynamicComponent = false;

    let vnodeProps: VNodeCall["props"];
    let vnodeChildren: VNodeCall["children"];
    let patchFlag: VNodeCall["patchFlag"] | 0 = 0;
    let vnodeDynamicProps: VNodeCall["dynamicProps"];
    let dynamicPropNames: string[] | undefined;
    let vnodeDirectives: VNodeCall["directives"];

    let shouldUseBlock = false;

    // props
    if (props.length > 0) {
      // console.log('node.props',node.props);

      const propsBuildResult = buildProps(
        node,
        context,
        undefined,
        isComponent,
        isDynamicComponent
      );
      vnodeProps = propsBuildResult.props;
      patchFlag = propsBuildResult.patchFlag;
      dynamicPropNames = propsBuildResult.dynamicPropNames;
      const directives = propsBuildResult.directives;
      vnodeDirectives =
        directives && directives.length
          ? (createArrayExpression(
              directives.map((dir) => {
                return buildDirectiveArgs(dir, context);
              })
            ) as DirectiveArguments)
          : undefined;
    }

    // children
    if (node.children.length > 0) {
      const shouldBuildAsSlots = false;

      if (shouldBuildAsSlots) {
      } else if (node.children.length === 1 && vnodeTag !== TELEPORT) {
        const child = node.children[0];
        const type = child.type;

        const hasDynamicTextChild = type === NodeTypes.INTERPOLATION;

        if (
          hasDynamicTextChild &&
          getConstantType(child, context) === ConstantTypes.NOT_CONSTANT
        ) {
          patchFlag |= PatchFlags.TEXT;
        }

        if (hasDynamicTextChild || type === NodeTypes.TEXT) {
          vnodeChildren = child as TemplateTextChildNode;
        }
      }
    }

    // patchFlag & dynamicPropNames
    if (dynamicPropNames && dynamicPropNames.length) {
      vnodeDynamicProps = stringifyDynamicPropNames(dynamicPropNames);
    }

    node.codegenNode = createVNodeCall(
      context,
      vnodeTag,
      vnodeProps,
      vnodeChildren,
      patchFlag === 0 ? undefined : patchFlag,
      vnodeDynamicProps,
      vnodeDirectives,
      !!shouldUseBlock,
      false /* disableTracking */,
      isComponent,
      node.loc
    );
  };
};

export type PropsExpression =
  | ExpressionNode
  | ObjectExpression
  | CallExpression;

export function buildProps(
  node: ElementNode,
  context: TransformContext,
  props: ElementNode["props"] | undefined = node.props,
  isComponent: boolean,
  isDynamicComponent: boolean,
  ssr = false
): {
  props: PropsExpression | undefined;
  directives: DirectiveNode[];
  patchFlag: number;
  dynamicPropNames: string[];
  shouldUseBlock: boolean;
} {
  const { tag, loc: elementLoc, children } = node;
  let properties: ObjectExpression["properties"] = [];
  const mergeArgs: PropsExpression[] = [];
  const runtimeDirectives: DirectiveNode[] = [];
  const hasChildren = children.length > 0;
  let shouldUseBlock = false;

  // patchFlag analysis
  let patchFlag = 0;
  let hasRef = false;
  let hasClassBinding = false;
  let hasStyleBinding = false;
  let hasHydrationEventBinding = false;
  let hasDynamicKeys = false;
  let hasVnodeHook = false;
  const dynamicPropNames: string[] = [];

  const analyzePatchFlag = ({ key, value }: Property) => {
    if (isStaticExp(key)) {
      const name = key.content;
      const isEventHandler = isOn(name);
      if (name === "ref") {
      } else if (name !== "key" && !dynamicPropNames.includes(name)) {
        dynamicPropNames.push(name);
      }
    } else {
      hasDynamicKeys = true;
    }
  };

  for (let i = 0; i < props.length; i++) {
    // static attribute
    const prop = props[i];

    if (prop.type === NodeTypes.ATTRIBUTE) {
      const { loc, name, nameLoc, value } = prop;
      let isStatic = true;
      // 將props整理成key value並蒐集{key:value}
      properties.push(
        createObjectProperty(
          // key
          createSimpleExpression(name, true, nameLoc),
          // value
          createSimpleExpression(
            value ? value.content : "",
            isStatic,
            value ? value.loc : loc
          )
        )
      );
    } else {
      //directives @click
      const { name, arg, exp, loc, modifiers } = prop;
      const isVBind = name === "bind";
      const isVOn = name === "on";

      const directiveTransform = context.directiveTransforms[name];
      if (directiveTransform) {
        // 設置v-model or event
        const { props, needRuntime } = directiveTransform(prop, node, context);
        props.forEach(analyzePatchFlag);

        if (isVOn && arg && !isStaticExp(arg)) {
        } else {
          properties.push(...props);
        }
        if (needRuntime) {
          runtimeDirectives.push(prop);
          if (isSymbol(needRuntime)) {
            directiveImportMap.set(prop, needRuntime);
          }
        }
      }
    }
  }

  let propsExpression: PropsExpression | undefined = undefined;

  if (mergeArgs.length) {
  } else if (properties.length) {
    propsExpression = createObjectExpression(
      dedupeProperties(properties),
      elementLoc
    );
  }
  // console.log("propsExpression", propsExpression);

  if (hasDynamicKeys) {
  } else {
    if (dynamicPropNames.length) {
      patchFlag |= PatchFlags.PROPS;
    }
  }

  if (!context.inSSR && propsExpression) {
    switch (propsExpression.type) {
      case NodeTypes.JS_OBJECT_EXPRESSION:
        // no-v-bind
        let classKeyIndex = -1;
        let styleKeyIndex = -1;
        let hasDynamicKey = false;

        for (let i = 0; i < propsExpression.properties.length; i++) {
          const key = propsExpression.properties[i].key;
          if (isStaticExp(key)) {
            if (key.content === "class") {
              classKeyIndex = i;
            }
          }
        }
        const classProp = propsExpression.properties[classKeyIndex];
        const styleProp = propsExpression.properties[styleKeyIndex];
        if (!hasDynamicKey) {
          if (classProp && !isStaticExp(classProp.value)) {
            classProp.value = createCallExpression(
              context.helper(NORMALIZE_CLASS),
              [classProp.value]
            );
          }
        }
        break;

      default:
        break;
    }
  }

  return {
    props: propsExpression,
    directives: runtimeDirectives,
    patchFlag,
    dynamicPropNames,
    shouldUseBlock,
  };

  // Dedupe props in an object literal.
  // Literal duplicated attributes would have been warned during the parse phase,
  // however, it's possible to encounter duplicated `onXXX` handlers with different
  // modifiers. We also need to merge static and dynamic class / style attributes.
  // - onXXX handlers / style: merge into array
  // - class: merge into single expression with concatenation
  function dedupeProperties(properties: Property[]): Property[] {
    const knownProps: Map<string, Property> = new Map();
    const deduped: Property[] = [];
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      // dynamic keys are always allowed
      if (
        prop.key.type === NodeTypes.COMPOUND_EXPRESSION ||
        !prop.key.isStatic
      ) {
        deduped.push(prop);
        continue;
      }
      const name = prop.key.content;
      const existing = knownProps.get(name);
      if (existing) {
        // if (name === 'style' || name === 'class' || isOn(name)) {
        //   mergeAsArray(existing, prop)
        // }
        // unexpected duplicate, should have emitted error during parse
      } else {
        knownProps.set(name, prop);
        deduped.push(prop);
      }
    }
    return deduped;
  }
}

/**
 * 例:v-mode:foo.bar="value"
 *
 * v-model > directiveFn
 * value > exp
 * :foo > arg
 * .bar > modifiers
 * @returns [指令函式(directiveFn), 表達式(exp), 參數(args), 修飾符(modifiers)]
 */
export function buildDirectiveArgs(
  dir: DirectiveNode,
  context: TransformContext
): ArrayExpression {
  const dirArgs: ArrayExpression["elements"] = [];
  const runtime = directiveImportMap.get(dir);

  if (runtime) {
    // built-in directive with runtime
    dirArgs.push(context.helperString(runtime));
  } else {
  }

  const { loc } = dir;
  if (dir.exp) dirArgs.push(dir.exp);
  if (dir.arg) {
    if (!dir.exp) {
      // 為了確保返回的位置都正確，如果沒有給予
      dirArgs.push(`void 0`);
    }
    dirArgs.push(dir.arg);
  }
  if (Object.keys(dir.modifiers).length) {
    if (!dir.arg) {
      if (!dir.exp) {
        dirArgs.push(`void 0`);
      }
      dirArgs.push(`void 0`);
    }
    const trueExpression = createSimpleExpression(`true`, false, loc);
    dirArgs.push(
      createObjectExpression(
        dir.modifiers.map((modifier) =>
          createObjectProperty(modifier, trueExpression)
        ),
        loc
      )
    );
  }

  return createArrayExpression(dirArgs, dir.loc);
}

function stringifyDynamicPropNames(props: string[]): string {
  let propsNamesString = `[`;
  for (let i = 0, l = props.length; i < l; i++) {
    propsNamesString += JSON.stringify(props[i]);
    if (i < l - 1) propsNamesString += ", ";
  }
  return propsNamesString + `]`;
}
