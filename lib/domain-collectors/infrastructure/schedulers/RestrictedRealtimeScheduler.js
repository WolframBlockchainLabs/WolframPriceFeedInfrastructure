import closestDivisor from '#utils/closestDivisor.js';
import Cron from 'croner';
import BaseScheduler from './BaseScheduler.js';
import ScheduleUnitContext from '../../utils/ScheduleUnitContext.js';

class RestrictedRealtimeScheduler extends BaseScheduler {
    static DEFAULT_MINIMAL_CYCLE_DURATION = 0;

    constructor({ clusterMembers, ...options }) {
        super(options);

        this.clusterMembers = clusterMembers;
        this.clusterTimeoutDescriptor = null;
        this.intraClusterDistance = 0;

        this.intraIntervalDistance = 0;
        this.batchTimeoutDescriptor = null;
        this.cronTask = null;

        this.interval = null;
        this.normalizedInterval = null;
        this.preciseNormalizedInterval = null;
    }

    get rateLimit() {
        return super.rateLimit + this.intraIntervalDistance;
    }

    async initializeScheduler() {
        this.cronTask = Cron(this.interval, () => {
            this.initializeClusterDelay();
        });
    }

    async destroyScheduler() {
        this.cronTask.stop();

        clearTimeout(this.clusterTimeoutDescriptor);
        clearTimeout(this.batchTimeoutDescriptor);

        await super.destroyScheduler();
    }

    setDynamicConfig(dynamicConfig) {
        super.setDynamicConfig(dynamicConfig);

        this.initInterval();
    }

    initInterval() {
        const intervalContext = this.getIntervalContext();

        this.setupInterval(intervalContext);
        this.setupIntraIntervalDistance();
    }

    getIntervalContext() {
        const clusterIntervalInMilliseconds = this.clusterMembers.reduce(
            (sum, clusterMember) => {
                return sum + clusterMember.getInterval();
            },
            0,
        );
        const scheduleContext = ScheduleUnitContext.getContext(
            clusterIntervalInMilliseconds,
        );

        return {
            clusterIntervalInMilliseconds,
            ...scheduleContext,
        };
    }

    setupInterval({
        clusterIntervalInMilliseconds,
        unit,
        timeUnitDivisor,
        cronString,
    }) {
        const intervalInUnits = Math.ceil(
            clusterIntervalInMilliseconds / timeUnitDivisor,
        );

        this.normalizedInterval = closestDivisor(intervalInUnits, unit);
        this.preciseNormalizedInterval =
            this.normalizedInterval * timeUnitDivisor;
        this.intraClusterDistance =
            (this.preciseNormalizedInterval - clusterIntervalInMilliseconds) /
            this.clusterMembers.length;
        this.interval = `*/${this.normalizedInterval} ` + cronString;
    }

    setupIntraIntervalDistance() {
        this.intraIntervalDistance =
            this.intraClusterDistance /
            (this.queueSize * this.operations.length * this.replicaSize);
    }

    initializeClusterDelay() {
        const clusterDelay = this.getOperationsClusterDelay();

        this.clusterTimeoutDescriptor = setTimeout(
            () => this.initializeBatch(),
            clusterDelay,
        );
    }

    getOperationsClusterDelay() {
        let clusterDelay = 0;

        for (let clusterMember of this.clusterMembers) {
            if (clusterMember.isSelf()) {
                return clusterDelay + this.intraClusterDistance / 2;
            }

            clusterDelay +=
                clusterMember.getInterval() + this.intraClusterDistance;
        }
    }

    initializeBatch() {
        const batchDelay = this.getOperationsBatchDelay();

        this.batchTimeoutDescriptor = setTimeout(
            () => super.initializeScheduler(),
            batchDelay,
        );
    }

    getOperationsBatchDelay() {
        return (
            this.rateLimit *
            this.queuePosition *
            this.operations.length *
            this.replicaSize
        );
    }

    getLogContext() {
        return {
            interval: this.interval,
            intraIntervalDistance: this.intraIntervalDistance,
            intraClusterDistance: this.intraClusterDistance,
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

    getIntervalSize() {
        return super.rateLimit * this.queueSize * this.operations.length;
    }

    getPreciseInterval() {
        return this.preciseNormalizedInterval;
    }

    getDynamicConfig() {
        const initialConfig = super.getDynamicConfig();

        return {
            ...initialConfig,
            clusterMembers: this.clusterMembers,
        };
    }
}

export default RestrictedRealtimeScheduler;
