import { Data } from "./component.js";
import { EmitsOptions } from "./componentEmits.js";
import { ComponentInjectOptions, ComponentOptionsBase, ComputedOptions, MethodOptions } from "./componentOptions.js";
import { SlotsType } from "./componentSlots.js";
export type ComponentPublicInstance<P = {}, // props type extracted from props option
B = {}, // raw bindings returned from setup()
D = {}, // return from data()
C extends ComputedOptions = {}, M extends MethodOptions = {}, E extends EmitsOptions = {}, PublicProps = {}, Defaults = {}, MakeDefaultsOptional extends boolean = false, Options = ComponentOptionsBase<any, any, any, any, any, any, any, any, any>, I extends ComponentInjectOptions = {}, S extends SlotsType = {}, Exposed extends string = "", TypeRefs extends Data = {}, TypeEl extends Element = any> = {};
export declare const RuntimeCompiledPublicInstanceProxyHandlers: ProxyHandler<any>;
