export function defaultOnError(error) {
    throw error;
}
export function defaultOnWarn(msg) {
    false && console.warn(`[Vue warn] ${msg.message}`);
}
