import { isRef } from "./ref.js";
class BaseReactiveHandler {
    constructor(_isReadonly = false, _isShallow = false) {
        this._isReadonly = _isReadonly;
        this._isShallow = _isShallow;
    }
    get(target, key, receiver) {
        const isReadonly = this._isReadonly, isShallow = this._isShallow;
        const res = Reflect.get(target, key, isRef(target) ? target : receiver);
        return res;
    }
}
class MutableReactiveHandler extends BaseReactiveHandler {
    constructor(isShallow = false) {
        super(false, isShallow);
    }
    set() {
        return true;
    }
    deleteProperty() {
        return true;
    }
    has() {
        return true;
    }
    ownKeys() {
        return true;
    }
}
export const mutableHandlers = 
/*@__PURE__*/ new MutableReactiveHandler();
