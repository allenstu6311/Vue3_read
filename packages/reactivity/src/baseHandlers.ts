import { isObject } from "../../shared/src/general.js";
import { ReactiveFlags } from "./constants.js";
import { Target } from "./reactive.js";
import { isRef } from "./ref.js";

// 代理proxy的get
class BaseReactiveHandler implements ProxyHandler<Target> {
  constructor(
    protected readonly _isReadonly = false,
    protected readonly _isShallow = false
  ) {}

  get(target: Target, key: string | symbol, receiver: object): any {
    const isReadonly = this._isReadonly,
      isShallow = this._isShallow;

    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }

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
    return true as any;
  }
}

export const mutableHandlers: ProxyHandler<object> =
  /*@__PURE__*/ new MutableReactiveHandler();
