/**
 * 自訂義物件元屬性方法
 */
function createInstrumentations() { }
function createInstrumentationGetter(isReadonly, shallow) {
    return () => true;
}
export const mutableCollectionHandlers = {
    get: /*@__PURE__*/ createInstrumentationGetter(false, false),
};
