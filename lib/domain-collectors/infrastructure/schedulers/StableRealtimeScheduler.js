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
    constructor(options) {
        super(options);

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

        const intervalInSeconds = Math.ceil(
            intervalInMilliseconds / MILLISECONDS_IN_A_SECOND,
        );

        if (intervalInSeconds < SECONDS_IN_A_MINUTE) {
            this.setupSecondPrecisionInterval({
                intervalInMilliseconds,
                intervalInSeconds,
            });
        } else {
            this.setupMinutePrecisionInterval({
                intervalInMilliseconds,
                intervalInSeconds,
            });
        }
    }

    setupMinutePrecisionInterval({
        intervalInMilliseconds,
        intervalInSeconds,
    }) {
        const intervalInMinutes = Math.ceil(
            intervalInSeconds / SECONDS_IN_A_MINUTE,
        );

        this.normalizedInterval = closestDivisor(
            intervalInMinutes,
            MINUTES_IN_AN_HOUR,
        );
        this.preciseNormalizedInterval =
            this.normalizedInterval * MILLISECONDS_IN_A_MINUTE;

        this.interval = `*/${this.normalizedInterval} * * * *`;
        this.intraIntervalDistance =
            (this.normalizedInterval * MILLISECONDS_IN_A_MINUTE -
                intervalInMilliseconds) /
            (this.queueSize * this.operationsAmount * this.replicaSize);
    }

    setupSecondPrecisionInterval({
        intervalInMilliseconds,
        intervalInSeconds,
    }) {
        this.normalizedInterval = closestDivisor(
            intervalInSeconds,
            SECONDS_IN_A_MINUTE,
        );
        this.preciseNormalizedInterval =
            this.normalizedInterval * MILLISECONDS_IN_A_SECOND;

        this.interval = `*/${this.normalizedInterval} * * * * *`;

        this.intraIntervalDistance =
            (this.normalizedInterval * MILLISECONDS_IN_A_SECOND -
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
