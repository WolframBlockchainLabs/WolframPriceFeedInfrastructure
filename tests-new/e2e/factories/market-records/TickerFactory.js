import { faker } from '@faker-js/faker';
import dumpTicker from '../../../../lib/use-cases/utils/dumps/dumpTicker.js';
import Ticker from '../../../../lib/domain-model/entities/market-records/Ticker.js';
import BaseMarketRecordFactory from './BaseMarketRecordFactory.js';

class TickerFactory extends BaseMarketRecordFactory {
    static DEFAULT_RECORDS_COUNT = 3;

    async createTickers({
        markets = [],
        recordsCount = TickerFactory.DEFAULT_RECORDS_COUNT,
    }) {
        const tickerPromises = markets.flatMap(({ id: marketId }) => {
            return Array.from({ length: recordsCount }, (_, index) => {
                return Ticker.create({
                    marketId,
                    intervalStart: this.shiftDateFor(
                        TickerFactory.INITIAL_INTERVAL_START,
                        index,
                    ),
                    intervalEnd: this.shiftDateFor(
                        TickerFactory.INITIAL_INTERVAL_END,
                        index,
                    ),
                    ...this.generateTickerData(),
                });
            });
        });

        const tickers = await Promise.all(tickerPromises);

        return tickers.map((ticker) => {
            return dumpTicker(ticker);
        });
    }

    async findTicker(recordId) {
        const ticker = await Ticker.scope([
            {
                method: ['searchById', recordId],
            },
        ]).findOne();

        return dumpTicker(ticker);
    }

    generateTickerData() {
        return {
            high: faker.number.float(),
            low: faker.number.float(),
            bid: faker.number.float(),
            bidVolume: faker.number.float(),
            ask: faker.number.float(),
            askVolume: faker.number.float(),
            vwap: faker.number.float(),
            open: faker.number.float(),
            close: faker.number.float(),
            last: faker.number.float(),
            previousClose: faker.number.float(),
            change: faker.number.float(),
            percentage: faker.number.float(),
            average: faker.number.float(),
            baseVolume: faker.number.float(),
            quoteVolume: faker.number.float(),
        };
    }
}

export default TickerFactory;
