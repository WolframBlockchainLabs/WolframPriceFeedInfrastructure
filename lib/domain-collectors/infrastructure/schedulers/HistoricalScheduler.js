import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import roundDateToMinute from '#utils/roundDateToMinute.js';
import StableRealtimeScheduler from './StableRealtimeScheduler.js';

class HistoricalScheduler extends StableRealtimeScheduler {
    static DEFAULT_OPERATION_LIMIT = 500;
    static DEFAULT_INITIAL_CYCLE_COUNTER = 0;

    constructor({
        scheduleStartDate,
        scheduleEndDate,
        operationLimit = HistoricalScheduler.DEFAULT_OPERATION_LIMIT,
        cycleCounter = HistoricalScheduler.DEFAULT_INITIAL_CYCLE_COUNTER,
        ...schedulerOptions
    }) {
        super(schedulerOptions);

        this.collectionStartDate = roundDateToMinute(scheduleStartDate);
        this.collectionEndDate = roundDateToMinute(scheduleEndDate);

        this.operationLimit = operationLimit;
        this.cycleCounter = cycleCounter;
        this.totalCycles = this.calculateTotalCycles();
        this.lastCycleLimit = this.calculateLastCycleLimit();
    }

    async start(dynamicOptions) {
        await super.start(dynamicOptions);

        this.logger.info({
            message: `'${
                this.taskName
            }' Historical Collector cycle will finish on: ${new Date(
                Date.now() + this.totalCycles * this.preciseNormalizedInterval,
            ).toISOString()}`,
            context: this.getLogContext(),
        });

        return this.initStartPromise();
    }

    initStartPromise() {
        return new Promise((resolve) => (this.resolveStartPromise = resolve));
    }

    async runOperations() {
        this.updateIntervalBounds();

        await super.runOperations();

        if (this.isFinalCycle) {
            await this.stop();

            this.logger.info({
                message: `'${this.taskName}' Historical Collector has been stopped`,
            });

            this.resolveStartPromise();
        }

        this.cycleCounter++;
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
        this.isFinalCycle = this.cycleCounter === this.totalCycles - 1;
        const cycleLimit = this.isFinalCycle
            ? this.lastCycleLimit
            : this.operationLimit;

        const intervalStartOffset =
            this.cycleCounter * this.operationLimit * MILLISECONDS_IN_A_MINUTE;
        const intervalEndOffset =
            intervalStartOffset + cycleLimit * MILLISECONDS_IN_A_MINUTE;

        this.intervalStart = this.collectionStartDate + intervalStartOffset;
        this.intervalEnd = this.collectionStartDate + intervalEndOffset;
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
}

export default HistoricalScheduler;
