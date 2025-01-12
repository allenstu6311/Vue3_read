export class ReactiveEffect {
}
/**
 * @internal
 */
export let shouldTrack = true;
const trackStack = [];
/**
 * 暫時停止追蹤(暫停響應式)
 */
export function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
}
/**
 * 重置之前的全域效果追蹤狀態。
 */
export function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === undefined ? true : last;
}
