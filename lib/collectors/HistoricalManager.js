import CollectorsManager from './CollectorsManager.js';

class HistoricalManager extends CollectorsManager {
    constructor({
        scheduleStartDate,
        scheduleEndDate,
        ...collectorsManagerOptions
    }) {
        super(collectorsManagerOptions);

        this.scheduleStartDate = scheduleStartDate;
        this.scheduleEndDate = scheduleEndDate;
    }

    async start() {
        await super.start();

        setTimeout(() => {
            this.cronTask.stop();

            this.logger.error({
                message: `'${this.exchange} & ${this.symbol}' Historical Collector has been stopped`,
            });
        }, new Date(this.scheduleEndDate) - new Date(this.scheduleStartDate));
    }

    setNextInterval() {
        this.intervalStart =
            this.schedule.prev().toDate() -
            this.roundDateToMinutes(this.scheduleStartDate).getTime();

        this.intervalEnd =
            this.schedule.next().toDate() -
            this.roundDateToMinutes(this.scheduleEndDate).getTime();

        this.schedule.next();
    }

    roundDateToMinutes(targetDate) {
        const date = new Date(targetDate);

        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    }
}

export default HistoricalManager;
