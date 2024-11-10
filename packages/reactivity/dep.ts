import { Subscriber } from "./effect.js"

/**
 * Represents a link between a source (Dep) and a subscriber (Effect or Computed).
 * Deps and subs have a many-to-many relationship - each link between a
 * dep and a sub is represented by a Link instance.
 *
 * A Link is also a node in two doubly-linked lists - one for the associated
 * sub to track all its deps, and one for the associated dep to track all its
 * subs.
 *
 * @internal
 */
export class Link {
    /**
     * - Before each effect run, all previous dep links' version are reset to -1
     * - During the run, a link's version is synced with the source dep on access
     * - After the run, links with version -1 (that were never used) are cleaned
     *   up
     */
    version: number

    /**
     * Pointers for doubly-linked lists
     */
    nextDep?: Link
    prevDep?: Link
    nextSub?: Link
    prevSub?: Link
    prevActiveLink?: Link

    constructor(
        public sub: Subscriber,
        public dep: any,
    ) {
        this.version = dep.version
        this.nextDep =
            this.prevDep =
            this.nextSub =
            this.prevSub =
            this.prevActiveLink =
            undefined
    }
}

// export class Dep {
//     version = 0
//     /**
//      * Link between this dep and the current active effect
//      */
//     activeLink?: Link = undefined

//     /**
//      * Doubly linked list representing the subscribing effects (tail)
//      */
//     subs?: Link = undefined

//     /**
//      * Doubly linked list representing the subscribing effects (head)
//      * DEV only, for invoking onTrigger hooks in correct order
//      */
//     subsHead?: Link

//     /**
//      * For object property deps cleanup
//      */
//     map?: KeyToDepMap = undefined
//     key?: unknown = undefined

//     /**
//      * Subscriber counter
//      */
//     sc: number = 0

//     constructor(public computed?: ComputedRefImpl | undefined) {

//     }

//     track(debugInfo?: DebuggerEventExtraInfo): Link | undefined {
//         if (!activeSub || !shouldTrack || activeSub === this.computed) {
//             return
//         }

//         let link = this.activeLink
//         if (link === undefined || link.sub !== activeSub) {
//             link = this.activeLink = new Link(activeSub, this)

//             // add the link to the activeEffect as a dep (as tail)
//             if (!activeSub.deps) {
//                 activeSub.deps = activeSub.depsTail = link
//             } else {
//                 link.prevDep = activeSub.depsTail
//                 activeSub.depsTail!.nextDep = link
//                 activeSub.depsTail = link
//             }

//             addSub(link)
//         } else if (link.version === -1) {
//             // reused from last run - already a sub, just sync version
//             link.version = this.version

//             // If this dep has a next, it means it's not at the tail - move it to the
//             // tail. This ensures the effect's dep list is in the order they are
//             // accessed during evaluation.
//             if (link.nextDep) {
//                 const next = link.nextDep
//                 next.prevDep = link.prevDep
//                 if (link.prevDep) {
//                     link.prevDep.nextDep = next
//                 }

//                 link.prevDep = activeSub.depsTail
//                 link.nextDep = undefined
//                 activeSub.depsTail!.nextDep = link
//                 activeSub.depsTail = link

//                 // this was the head - point to the new head
//                 if (activeSub.deps === link) {
//                     activeSub.deps = next
//                 }
//             }
//         }

//         if (__DEV__ && activeSub.onTrack) {
//             activeSub.onTrack(
//                 extend(
//                     {
//                         effect: activeSub,
//                     },
//                     debugInfo,
//                 ),
//             )
//         }

//         return link
//     }

//     trigger(debugInfo?: DebuggerEventExtraInfo): void {
//         this.version++
//         globalVersion++
//         this.notify(debugInfo)
//     }

//     notify(debugInfo?: DebuggerEventExtraInfo): void {
//         startBatch()
//         try {
//             if (__DEV__) {
//                 // subs are notified and batched in reverse-order and then invoked in
//                 // original order at the end of the batch, but onTrigger hooks should
//                 // be invoked in original order here.
//                 for (let head = this.subsHead; head; head = head.nextSub) {
//                     if (head.sub.onTrigger && !(head.sub.flags & EffectFlags.NOTIFIED)) {
//                         head.sub.onTrigger(
//                             extend(
//                                 {
//                                     effect: head.sub,
//                                 },
//                                 debugInfo,
//                             ),
//                         )
//                     }
//                 }
//             }
//             for (let link = this.subs; link; link = link.prevSub) {
//                 if (link.sub.notify()) {
//                     // if notify() returns `true`, this is a computed. Also call notify
//                     // on its dep - it's called here instead of inside computed's notify
//                     // in order to reduce call stack depth.
//                     ; (link.sub as ComputedRefImpl).dep.notify()
//                 }
//             }
//         } finally {
//             endBatch()
//         }
//     }
// }