import closestDivisor from '#utils/closestDivisor.js';
import {
    MILLISECONDS_IN_A_MINUTE,
    MILLISECONDS_IN_A_SECOND,
    MINUTES_IN_AN_HOUR,
    SECONDS_IN_A_MINUTE,
} from '#constants/timeframes.js';
import Cron from 'croner';
import BaseScheduler from './BaseScheduler.js';

class StableRealtimeScheduler extends BaseScheduler {
    static DEFAULT_MINIMAL_CYCLE_DURATION = 0;

    constructor({
        minimalCycleDuration = StableRealtimeScheduler.DEFAULT_MINIMAL_CYCLE_DURATION,
        ...options
    }) {
        super(options);

        this.minimalCycleDuration = minimalCycleDuration;

        this.cronTask = null;
        this.interval = null;
        this.normalizedInterval = null;
        this.preciseNormalizedInterval = null;
    }

    async initializeScheduler() {
        this.setupInterval();

        this.cronTask = Cron(this.interval, () => {
            const batchDelay = this.getOperationsBatchDelay();

            this.batchTimeoutDescriptor = setTimeout(
                () => super.initializeScheduler(),
                batchDelay,
            );
        });
    }

    async destroyScheduler() {
        this.cronTask.stop();

        await super.destroyScheduler();
    }

    setupInterval() {
        const intervalInMilliseconds =
            this.rateLimit *
            this.queueSize *
            this.operationsAmount *
            this.replicaSize;

        if (
            Math.max(intervalInMilliseconds, this.minimalCycleDuration) <
            MILLISECONDS_IN_A_MINUTE
        ) {
            this.calculateInterval({
                intervalInMilliseconds,
                unit: SECONDS_IN_A_MINUTE,
                timeUnitDivisor: MILLISECONDS_IN_A_SECOND,
                cronString: '* * * * *',
            });
        } else {
            this.calculateInterval({
                intervalInMilliseconds,
                unit: MINUTES_IN_AN_HOUR,
                timeUnitDivisor: MILLISECONDS_IN_A_MINUTE,
                cronString: '* * * *',
            });
        }
    }

    calculateInterval({
        intervalInMilliseconds,
        unit,
        timeUnitDivisor,
        cronString,
    }) {
        const intervalInUnits = Math.ceil(
            Math.max(intervalInMilliseconds, this.minimalCycleDuration) /
                timeUnitDivisor,
        );

        this.normalizedInterval = closestDivisor(intervalInUnits, unit);
        this.preciseNormalizedInterval =
            this.normalizedInterval * timeUnitDivisor;

        this.interval = `*/${this.normalizedInterval} ` + cronString;
        this.intraIntervalDistance =
            (this.normalizedInterval * timeUnitDivisor -
                intervalInMilliseconds) /
            (this.queueSize * this.operationsAmount * this.replicaSize);
    }

    getLogContext() {
        return {
            interval: this.interval,
            intraIntervalDistance: this.intraIntervalDistance,
            normalizedInterval: this.normalizedInterval,
            preciseNormalizedInterval: this.preciseNormalizedInterval,
            ...super.getLogContext(),
        };
    }

    getIntervalBounds() {
        const intervalEnd = new Date(
            this.cronTask.currentRun().setMilliseconds(0),
        ).getTime();

        return {
            intervalStart: intervalEnd - this.preciseNormalizedInterval,
            intervalEnd,
        };
    }
}

export default StableRealtimeScheduler;
