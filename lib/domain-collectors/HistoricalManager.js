import { MILLISECONDS_IN_A_MINUTE } from '../constants/timeframes.js';
import CollectorsManager from './CollectorsManager.js';

class HistoricalManager extends CollectorsManager {
    constructor({
        scheduleStartDate,
        scheduleEndDate,
        ...collectorsManagerOptions
    }) {
        super({
            ...collectorsManagerOptions,
            replicaSize: 1,
            instancePosition: 0,
        });

        this.scheduleStartDate =
            this.roundDateToMinutes(scheduleStartDate).getTime();
        this.scheduleEndDate =
            this.roundDateToMinutes(scheduleEndDate).getTime();

        this.cycleCounter = null;
        this.cycleCeil = null;
        this.limit = 500;
        this.lastLimit = null;
    }

    async start() {
        await super.start();

        this.initCycleCounter();

        return new Promise((res) => {
            const cycleTime =
                this.normalizedInterval * MILLISECONDS_IN_A_MINUTE;

            setTimeout(() => {
                this.cronTask.stop();

                this.logger.info({
                    message: `'${this.exchange} & ${this.symbol}' Historical Collector cycle has been stopped`,
                });

                setTimeout(res, cycleTime);
            }, this.cycleCeil * cycleTime);
        });
    }

    setNextInterval() {
        const isLastCycle = this.cycleCounter === this.cycleCeil - 1;
        const cycleLimit = isLastCycle ? this.lastLimit : this.limit;

        const intervalStartOffset =
            this.cycleCounter * MILLISECONDS_IN_A_MINUTE * this.limit;
        const intervalEndOffset =
            intervalStartOffset + cycleLimit * MILLISECONDS_IN_A_MINUTE;

        this.intervalStart = this.scheduleStartDate + intervalStartOffset;
        this.intervalEnd = this.scheduleStartDate + intervalEndOffset;

        this.cycleCounter++;
    }

    initCycleCounter() {
        this.cycleCeil = Math.ceil(
            (this.scheduleEndDate - this.scheduleStartDate) /
                MILLISECONDS_IN_A_MINUTE /
                this.limit,
        );

        this.cycleCounter = 0;
        this.lastLimit =
            ((this.scheduleEndDate - this.scheduleStartDate) /
                MILLISECONDS_IN_A_MINUTE) %
            this.limit;
    }

    roundDateToMinutes(targetDate) {
        const date = new Date(targetDate);

        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    }
}

export default HistoricalManager;
