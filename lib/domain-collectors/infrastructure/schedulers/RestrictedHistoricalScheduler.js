import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import roundDateToMinute from '#utils/roundDateToMinute.js';
import RestrictedRealtimeScheduler from './RestrictedRealtimeScheduler.js';

class RestrictedHistoricalScheduler extends RestrictedRealtimeScheduler {
    static DEFAULT_OPERATION_LIMIT = 500;
    static DEFAULT_INITIAL_CYCLE_COUNTER = 0;
    static DEFAULT_RELOAD_CYCLE_BACKOFF = 5;

    constructor({
        scheduleStartDate,
        scheduleEndDate,
        operationLimit = RestrictedHistoricalScheduler.DEFAULT_OPERATION_LIMIT,
        cycleCounter = RestrictedHistoricalScheduler.DEFAULT_INITIAL_CYCLE_COUNTER,
        reloadCyclesBackoff = RestrictedHistoricalScheduler.DEFAULT_RELOAD_CYCLE_BACKOFF,
        ...schedulerOptions
    }) {
        super(schedulerOptions);

        this.collectionStartDate = roundDateToMinute(scheduleStartDate);
        this.collectionEndDate = roundDateToMinute(scheduleEndDate);

        this.operationLimit = operationLimit;
        this.cycleCounter = cycleCounter;
        this.reloadCyclesBackoff = reloadCyclesBackoff;
        this.totalCycles = this.calculateTotalCycles();
        this.lastCycleLimit = this.calculateLastCycleLimit();

        this.schedulePromise = new Promise((resolve) => {
            this.resolveSchedule = resolve;
        });
    }

    async start(dynamicOptions) {
        await super.start(dynamicOptions);

        const endDate = this.estimateDurationTime();

        this.logger.info({
            message: `'${this.taskName}' Historical Collector cycle will approximately finish on: ${endDate}`,
            context: this.getLogContext(),
        });
    }

    async handleReloadSleep(options) {
        this.backoffCycles();

        return super.handleReloadSleep(options);
    }

    async runOperations() {
        const isLastCycle = this.updateIntervalBounds();

        if (isLastCycle) this.cronTask.stop();

        await super.runOperations();

        if (isLastCycle) this.resolveSchedule();
    }

    estimateDurationTime() {
        const duration =
            (this.totalCycles + 1 - this.cycleCounter) *
            this.preciseNormalizedInterval;

        return new Date(Date.now() + duration).toISOString();
    }

    backoffCycles() {
        const backoffSize = Math.min(
            this.cycleCounter,
            this.reloadCyclesBackoff,
        );

        this.cycleCounter -= backoffSize;
    }

    calculateTotalCycles() {
        const totalMinutes =
            (this.collectionEndDate - this.collectionStartDate) /
            MILLISECONDS_IN_A_MINUTE;

        return Math.ceil(totalMinutes / this.operationLimit);
    }

    calculateLastCycleLimit() {
        const remainingMinutes =
            ((this.collectionEndDate - this.collectionStartDate) /
                MILLISECONDS_IN_A_MINUTE) %
            this.operationLimit;

        return remainingMinutes || this.operationLimit;
    }

    updateIntervalBounds() {
        if (this.cycleCounter >= this.totalCycles) return true;

        const isFinalCycle = this.cycleCounter >= this.totalCycles - 1;
        const cycleLimit = isFinalCycle
            ? this.lastCycleLimit
            : this.operationLimit;

        const intervalStartOffset =
            this.cycleCounter * this.operationLimit * MILLISECONDS_IN_A_MINUTE;
        const intervalEndOffset =
            intervalStartOffset + cycleLimit * MILLISECONDS_IN_A_MINUTE;

        this.intervalStart = this.collectionStartDate + intervalStartOffset;
        this.intervalEnd = this.collectionStartDate + intervalEndOffset;

        this.cycleCounter++;
        return isFinalCycle;
    }

    getLogContext() {
        return {
            operationLimit: this.operationLimit,
            cycleCounter: this.cycleCounter,
            totalCycles: this.totalCycles,
            lastCycleLimit: this.lastCycleLimit,
            ...super.getLogContext(),
        };
    }

    getIntervalBounds() {
        return {
            intervalStart: this.intervalStart,
            intervalEnd: this.intervalEnd,
        };
    }

    getSchedulePromise() {
        return this.schedulePromise;
    }
}

export default RestrictedHistoricalScheduler;
