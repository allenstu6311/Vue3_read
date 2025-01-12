import { Subscriber } from "./effect.js";
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
export declare class Link {
    sub: Subscriber;
    dep: any;
    /**
     * - Before each effect run, all previous dep links' version are reset to -1
     * - During the run, a link's version is synced with the source dep on access
     * - After the run, links with version -1 (that were never used) are cleaned
     *   up
     */
    version: number;
    /**
     * Pointers for doubly-linked lists
     */
    nextDep?: Link;
    prevDep?: Link;
    nextSub?: Link;
    prevSub?: Link;
    prevActiveLink?: Link;
    constructor(sub: Subscriber, dep: any);
}
