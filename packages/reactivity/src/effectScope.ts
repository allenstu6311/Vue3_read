import { ReactiveEffect } from "./effect.js";

export let activeEffectScope: EffectScope | undefined;

export class EffectScope {
  /**
   * @internal
   */
  private _active = true;
  /**
   * @internal
   */
  effects: ReactiveEffect[] = [];
  /**
   * @internal
   */
  cleanups: (() => void)[] = [];

  private _isPaused = false;

  /**
   * only assigned by undetached scope
   * @internal
   */
  parent: EffectScope | undefined;
  /**
   * record undetached scopes
   * @internal
   */
  scopes: EffectScope[] | undefined;
  /**
   * track a child scope's index in its parent's scopes array for optimized
   * removal
   * @internal
   */
  private index: number | undefined;

  constructor(public detached = false) {
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index =
        (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
    }
  }

  get active(): boolean {
    return this._active;
  }

  pause(): void {}

  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume(): void {}

  run<T>(fn: () => T) {}

  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on(): void {
    activeEffectScope = this;
  }

  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off(): void {
    activeEffectScope = this.parent;
  }

  stop(fromParent?: boolean): void {
    if (this._active) {
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
      }
      // nested scope, dereference from parent to avoid memory leaks
      if (!this.detached && this.parent && !fromParent) {
        // optimized O(1) removal
        const last = this.parent.scopes!.pop();
        if (last && last !== this) {
          this.parent.scopes![this.index!] = last;
          last.index = this.index!;
        }
      }
      this.parent = undefined;
      this._active = false;
    }
  }
}
