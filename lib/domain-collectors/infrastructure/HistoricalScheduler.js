import { MILLISECONDS_IN_A_MINUTE } from '../../constants/timeframes.js';
import roundDateToMinute from '../../utils/roundDateToMinute.js';
import sleep from '../../utils/sleep.js';
import RealtimeScheduler from './RealtimeScheduler.js';

class HistoricalScheduler extends RealtimeScheduler {
    static DEFAULT_OPERATION_LIMIT = 500;
    static DEFAULT_INITIAL_CYCLE_COUNTER = 0;

    static SINGLE_REPLICA_CONFIG = {
        replicaSize: 1,
        instancePosition: 0,
    };

    constructor({ scheduleStartDate, scheduleEndDate, ...schedulerOptions }) {
        super({
            ...schedulerOptions,
            ...HistoricalScheduler.SINGLE_REPLICA_CONFIG,
        });

        this.collectionStartDate = roundDateToMinute(scheduleStartDate);
        this.collectionEndDate = roundDateToMinute(scheduleEndDate);

        this.operationLimit = HistoricalScheduler.DEFAULT_OPERATION_LIMIT;
        this.cycleCounter = HistoricalScheduler.DEFAULT_INITIAL_CYCLE_COUNTER;
        this.totalCycles = this.calculateTotalCycles();
        this.lastCycleLimit = this.calculateLastCycleLimit();
    }

    async start({ handler, rateLimitMultiplier }) {
        await super.start({ handler, rateLimitMultiplier });

        await this.handleStop();
    }

    async handleStop() {
        const cycleTime = this.normalizedInterval * MILLISECONDS_IN_A_MINUTE;
        const sleepTime = this.totalCycles * cycleTime;

        this.logger.info({
            message: `'${
                this.taskName
            }' Historical Collector cycle will finish on: ${new Date(
                Date.now() + sleepTime,
            ).toISOString()}`,
        });

        await sleep(sleepTime);
        await this.stop();

        this.logger.info({
            message: `'${this.taskName}' Historical Collector cycle has been stopped`,
        });
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
        const isFinalCycle = this.cycleCounter === this.totalCycles - 1;
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
    }
}

export default HistoricalScheduler;
