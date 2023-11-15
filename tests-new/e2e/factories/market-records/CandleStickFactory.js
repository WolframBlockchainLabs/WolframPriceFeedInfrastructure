import { faker } from '@faker-js/faker';
import CandleStick from '../../../../lib/domain-model/entities/market-records/CandleStick.js';
import dumpCandleStick from '../../../../lib/use-cases/utils/dumps/dumpCandleStick.js';
import BaseMarketRecordFactory from './BaseMarketRecordFactory.js';

class CandleStickFactory extends BaseMarketRecordFactory {
    static CANDLE_STICK_ITEMS_COUNT = 5;

    static DEFAULT_CHARTS_COUNT = 3;

    static DEFAULT_RECORDS_COUNT = 3;

    async createCandleSticks({
        markets = [],
        recordsCount = CandleStickFactory.DEFAULT_RECORDS_COUNT,
        chartsCount = CandleStickFactory.DEFAULT_CHARTS_COUNT,
    }) {
        const candleStickPromises = markets.flatMap(({ id: marketId }) => {
            return Array.from({ length: recordsCount }, (_, index) => {
                return CandleStick.create({
                    marketId,
                    intervalStart: this.shiftDateFor(
                        CandleStickFactory.INITIAL_INTERVAL_START,
                        index,
                    ),
                    intervalEnd: this.shiftDateFor(
                        CandleStickFactory.INITIAL_INTERVAL_END,
                        index,
                    ),
                    charts: this.generateCandleStickCharts(chartsCount),
                });
            });
        });

        const candleSticks = await Promise.all(candleStickPromises);

        return candleSticks.map((candleStick) => {
            return dumpCandleStick(candleStick);
        });
    }

    generateCandleStickCharts(
        length = CandleStickFactory.DEFAULT_CHARTS_COUNT,
    ) {
        return Array.from({ length }, () => {
            Array.from(
                { length: CandleStickFactory.CANDLE_STICK_ITEMS_COUNT },
                () => faker.number.float(),
            );
        });
    }
}

export default CandleStickFactory;
