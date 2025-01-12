import { Target } from "./reactive.js";
type CollectionTypes = IterableCollections | WeakCollections;
type IterableCollections = (Map<any, any> | Set<any>) & Target;
type WeakCollections = (WeakMap<any, any> | WeakSet<any>) & Target;
export declare const mutableCollectionHandlers: ProxyHandler<CollectionTypes>;
export {};
