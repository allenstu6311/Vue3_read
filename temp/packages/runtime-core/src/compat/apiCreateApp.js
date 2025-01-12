import { extend, isFunction, isObject, NO, } from "../../../shared/src/general.js";
import { createVNode } from "../vnode.js";
/**
 * 全局配置 (AppConfig) 介面
 * 用於控制應用的行為和設置
 */
export function createAppContext() {
    return {
        app: null,
        config: {
            isNativeTag: NO,
            performance: false,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: undefined,
            warnHandler: undefined,
            compilerOptions: {},
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap(),
        propsCache: new WeakMap(),
        emitsCache: new WeakMap(),
    };
}
let uid = 0;
export function createAppAPI(render
// hydrate?:
) {
    return function createApp(rootComponent, rootProps = null) {
        if (!isFunction(rootComponent)) {
            rootComponent = extend({}, rootComponent);
        }
        if (rootProps != null && !isObject(rootProps)) {
            rootProps = null;
        }
        const context = createAppContext();
        const installedPlugins = new WeakMap();
        const pluginCleanupFns = [];
        let isMounted = false;
        const app = (context.app = {
            _uid: uid++,
            _component: rootComponent,
            mount(rootContainer, isHydrate, namespace) {
                if (!isMounted) {
                    const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
                    vnode.appContext = context;
                    if (namespace === true) {
                        namespace = "svg";
                    }
                    else if (namespace === false) {
                        namespace = undefined;
                    }
                    render(vnode, rootContainer, namespace);
                    isMounted = true;
                    // console.log("vnode", vnode);
                }
                return null;
            },
        });
        return app;
    };
}
