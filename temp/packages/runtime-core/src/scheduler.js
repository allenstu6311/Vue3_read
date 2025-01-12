export var SchedulerJobFlags;
(function (SchedulerJobFlags) {
    SchedulerJobFlags[SchedulerJobFlags["QUEUED"] = 1] = "QUEUED";
    SchedulerJobFlags[SchedulerJobFlags["PRE"] = 2] = "PRE";
    /**
     * Indicates whether the effect is allowed to recursively trigger itself
     * when managed by the scheduler.
     *
     * By default, a job cannot trigger itself because some built-in method calls,
     * e.g. Array.prototype.push actually performs reads as well (#1740) which
     * can lead to confusing infinite loops.
     * The allowed cases are component update functions and watch callbacks.
     * Component update functions may update child component props, which in turn
     * trigger flush: "pre" watch callbacks that mutates state that the parent
     * relies on (#1801). Watch callbacks doesn't track its dependencies so if it
     * triggers itself again, it's likely intentional and it is the user's
     * responsibility to perform recursive state mutation that eventually
     * stabilizes (#1727).
     */
    SchedulerJobFlags[SchedulerJobFlags["ALLOW_RECURSE"] = 4] = "ALLOW_RECURSE";
    SchedulerJobFlags[SchedulerJobFlags["DISPOSED"] = 8] = "DISPOSED";
})(SchedulerJobFlags || (SchedulerJobFlags = {}));
