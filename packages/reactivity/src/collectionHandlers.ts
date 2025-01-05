import { Target } from "./reactive.js"

type CollectionTypes = IterableCollections | WeakCollections
type IterableCollections = (Map<any, any> | Set<any>) & Target
type WeakCollections = (WeakMap<any, any> | WeakSet<any>) & Target

/**
 * 自訂義物件元屬性方法
 */
function createInstrumentations (){}

function createInstrumentationGetter(isReadonly: boolean, shallow: boolean) {
    return ()=> true
}
export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
    get: /*@__PURE__*/ createInstrumentationGetter(false, false),
}