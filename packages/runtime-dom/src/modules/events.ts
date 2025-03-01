import { ComponentInternalInstance } from "../../../runtime-core/src/component.js";
import { callWithAsyncErrorHandling, ErrorCodes } from "../../../runtime-core/src/errorHandling.js";
import { hyphenate, isArray } from "../../../shared/src/general.js";

interface Invoker extends EventListener {
    value: EventValue
    attached: number
}

type EventValue = Function | Function[]

export function addEventListener(
    el: Element,
    event: string,
    handler: EventListener,
    options?: EventListenerOptions,
): void {
    el.addEventListener(event, handler, options)
}

let cachedNow: number = 0
const p = /*@__PURE__*/ Promise.resolve()
const getNow = () =>
    cachedNow || (p.then(() => (cachedNow = 0)), (cachedNow = Date.now()))

function createInvoker(
    initialValue: EventValue,
    instance: ComponentInternalInstance | null,
) {
    const invoker: Invoker = (e: Event & { _vts?: number }) => {
        // async edge case vuejs/vue#6566
        // inner click event triggers patch, event handler
        // attached to outer element during patch, and triggered again. This
        // happens because browsers fire microtask ticks between event propagation.
        // this no longer happens for templates in Vue 3, but could still be
        // theoretically possible for hand-written render functions.
        // the solution: we save the timestamp when a handler is attached,
        // and also attach the timestamp to any event that was handled by vue
        // for the first time (to avoid inconsistent event timestamp implementations
        // or events fired from iframes, e.g. #2513)
        // The handler would only fire if the event passed to it was fired
        // AFTER it was attached.
        if (!e._vts) {
            e._vts = Date.now()
        } else if (e._vts <= invoker.attached) {
            return
        }
        callWithAsyncErrorHandling(
            patchStopImmediatePropagation(e, invoker.value),
            instance,
            ErrorCodes.NATIVE_EVENT_HANDLER,
            [e],
        )
    }
    invoker.value = initialValue
    invoker.attached = getNow()
    return invoker
}

const veiKey: unique symbol = Symbol('_vei')

export function patchEvent(
    el: Element & { [veiKey]?: Record<string, Invoker | undefined> },
    rawName: string,
    prevValue: EventValue | null,
    nextValue: EventValue | unknown, //function
    instance: ComponentInternalInstance | null = null, // Vue instance
): void {
    const invokers = el[veiKey] || (el[veiKey] = {})
    const existingInvoker = invokers[rawName]
    if (nextValue && existingInvoker) {

    } else {
        const [name, options] = parseName(rawName)// [click, XX]

        if (nextValue) {
            const invoker = (invokers[rawName] = createInvoker(
                nextValue as EventValue,
                instance
            ))
            addEventListener(el, name, invoker, options)
        }
    }
}


const optionsModifierRE = /(?:Once|Passive|Capture)$/

function parseName(name: string): [string, EventListenerOptions | undefined] {
    let options: EventListenerOptions | undefined
    if (optionsModifierRE.test(name)) {
        options = {}
        let m
        while ((m = name.match(optionsModifierRE))) {
            name = name.slice(0, name.length - m[0].length)
                ; (options as any)[m[0].toLowerCase()] = true
        }
    }
    const event = name[2] === ':' ? name.slice(3) : hyphenate(name.slice(2))
    return [event, options]
}

/**
 * 要能支援@click="[fn1, fn2, fn3]"
 * 並且也要支援stopImmediatePropagation
 */
function patchStopImmediatePropagation(
    e: Event,
    value: EventValue,
): EventValue {
    if (isArray(value)) {
        const originalStop = e.stopImmediatePropagation
        e.stopImmediatePropagation = () => {
            originalStop.call(e)
                ; (e as any)._stopped = true
        }
        return (value as Function[]).map(
            fn => (e: Event) => !(e as any)._stopped && fn && fn(e),
        )
    } else {
        return value
    }
}