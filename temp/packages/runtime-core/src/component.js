import { pauseTracking, resetTracking, } from "../../reactivity/src/effect.js";
import { EffectScope } from "../../reactivity/src/effectScope.js";
import { proxyRefs } from "../../reactivity/src/ref.js";
import { EMPTY_OBJ, isFunction, isObject, NOOP, } from "../../shared/src/general.js";
import { ShapeFlags } from "../../shared/src/shapeFlags.js";
import { createAppContext } from "./compat/apiCreateApp.js";
import { normalizeEmitsOptions, } from "./componentEmits.js";
import { normalizePropsOptions, } from "./componentProps.js";
import { RuntimeCompiledPublicInstanceProxyHandlers, } from "./componentPublicInstance.js";
import { LifecycleHooks } from "./enums.js";
import { callWithErrorHandling, ErrorCodes } from "./errorHandling.js";
export let currentInstance = null;
export let isInSSRComponentSetup = false;
let compile;
let installWithProxy;
/**
 * 註冊運行時編譯器（Runtime Compiler）。
 * @param _compile 編譯模板的關鍵函數
 */
export function registerRuntimeCompiler(_compile) {
    compile = _compile;
    installWithProxy = (i) => {
        if (i.render._rc) {
            i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers);
        }
    };
}
const emptyAppContext = createAppContext();
let uid = 0;
export function createComponentInstance(vnode, parent, suspense) {
    const type = vnode.type;
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
        uid: uid++,
        vnode,
        type,
        parent,
        appContext,
        root: null, // to be immediately set
        next: null,
        subTree: null, // will be set synchronously right after creation
        effect: null,
        update: null, // will be set synchronously right after creation
        job: null,
        scope: new EffectScope(true /* detached */),
        render: null,
        proxy: null,
        exposed: null,
        exposeProxy: null,
        withProxy: null,
        provides: parent ? parent.provides : Object.create(appContext.provides),
        ids: parent ? parent.ids : ["", 0, 0],
        accessCache: null,
        renderCache: [],
        // local resolved assets
        components: null,
        directives: null,
        // resolved props and emits options
        propsOptions: normalizePropsOptions(type, appContext),
        emitsOptions: normalizeEmitsOptions(type, appContext),
        // emit
        emit: null, // to be set immediately
        emitted: null,
        // props default value
        propsDefaults: EMPTY_OBJ,
        // inheritAttrs
        inheritAttrs: type.inheritAttrs,
        // state
        ctx: EMPTY_OBJ,
        data: EMPTY_OBJ,
        props: EMPTY_OBJ,
        attrs: EMPTY_OBJ,
        slots: EMPTY_OBJ,
        refs: EMPTY_OBJ,
        setupState: EMPTY_OBJ,
        setupContext: null,
        // suspense related
        suspense,
        suspenseId: suspense ? suspense.pendingId : 0,
        asyncDep: null,
        asyncResolved: false,
        // lifecycle hooks
        // not using enums here because it results in computed properties
        isMounted: false,
        isUnmounted: false,
        isDeactivated: false,
        bc: null,
        c: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        bum: null,
        da: null,
        a: null,
        rtg: null,
        rtc: null,
        ec: null,
        sp: null,
    };
    instance.root = parent ? parent.root : instance;
    return instance;
}
/**
 * 是否唯有狀態的組件
 */
export function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
}
export function setupComponent(instance, isSSR = false, optimized = false) {
    // const { props, children } = instance.vnode;
    const isStateful = isStatefulComponent(instance);
    const setupResult = isStateful
        ? setupStatefulComponent(instance, isSSR)
        : undefined;
    return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
    const Component = instance.type;
    // 建立快取
    instance.accessCache = Object.create(null);
    const { setup } = Component;
    if (setup) {
        pauseTracking();
        const setupContext = (instance.setupContext = null);
        // setup return
        const setupResult = callWithErrorHandling(setup, instance, ErrorCodes.SETUP_FUNCTION, [setupContext]);
        resetTracking();
        // missing reset
        handleSetupResult(instance, setupResult, isSSR);
    }
}
export function handleSetupResult(instance, setupResult, isSSR) {
    if (isFunction(setupResult)) {
    }
    else if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance, isSSR);
}
export function finishComponentSetup(instance, isSSR, skipOptions) {
    const Component = instance.type;
    if (!instance.render && compile && !Component.render) {
        if (!isSSR) {
            const template = Component.template; //{{ test }}
            if (template) {
                // 正式渲染
                Component.render = compile(template);
            }
        }
        instance.render = (Component.render || NOOP);
    }
}
