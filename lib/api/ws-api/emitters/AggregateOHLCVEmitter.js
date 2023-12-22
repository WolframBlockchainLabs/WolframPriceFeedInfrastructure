import AggregateCandleSticks from '#use-cases/candle-sticks/Aggregate.js';
import BaseEmitter from './BaseEmitter.js';

class AggregateOHLCVEmitter extends BaseEmitter {
    constructor(options) {
        super(options);

        this.aggregateCandleSticks = new AggregateCandleSticks({
            context: {},
        });
    }

    run() {
        super.run();

        setInterval(
            this.process.bind(this),
            this.config.aggregateOHLCVEmitter.interval,
        );
    }

    async process() {
        const aggregatedData = await this.fetchAggregation();

        this.io.emit('AggregateOHLCV', aggregatedData);

        this.logger.info(`AggregateOHLCV event has been emitted successfully`);
    }

    async fetchAggregation() {
        const rangeDateEnd = Date.now();
        const rangeDateStart =
            rangeDateEnd - this.config.aggregateOHLCVEmitter.interval;

        return this.aggregateCandleSticks.run({
            rangeDateStart: new Date(rangeDateStart).toISOString(),
            rangeDateEnd: new Date(rangeDateEnd).toISOString(),
            symbols: this.config.aggregateOHLCVEmitter.pairs,
            exchangeNames: this.config.aggregateOHLCVEmitter.exchanges,
        });
    }
}

export default AggregateOHLCVEmitter;
