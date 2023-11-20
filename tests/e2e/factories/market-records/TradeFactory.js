import { faker } from '@faker-js/faker';
import Trade from '../../../../lib/domain-model/entities/market-records/Trade.js';
import dumpTrade from '../../../../lib/use-cases/utils/dumps/dumpTrade.js';
import BaseMarketRecordFactory from './BaseMarketRecordFactory.js';

class TradeFactory extends BaseMarketRecordFactory {
    static TRADE_ITEMS_COUNT = 4;

    static DEFAULT_TRADES_COUNT = 3;

    static DEFAULT_RECORDS_COUNT = 3;

    async createTrades({
        markets = [],
        recordsCount = TradeFactory.DEFAULT_RECORDS_COUNT,
        tradesCount = TradeFactory.DEFAULT_TRADES_COUNT,
    }) {
        const tradePromises = markets.flatMap(({ id: marketId }) => {
            return Array.from({ length: recordsCount }, (_, index) => {
                return Trade.create({
                    marketId,
                    intervalStart: this.shiftDateFor(
                        TradeFactory.INITIAL_INTERVAL_START,
                        index,
                    ),
                    intervalEnd: this.shiftDateFor(
                        TradeFactory.INITIAL_INTERVAL_END,
                        index,
                    ),
                    tradesInfo: this.generateTradeData(tradesCount),
                });
            });
        });

        const trades = await Promise.all(tradePromises);

        return trades.map((trade) => {
            return dumpTrade(trade);
        });
    }

    async findTrade(recordId) {
        const trade = await Trade.scope([
            {
                method: ['searchById', recordId],
            },
        ]).findOne();

        return dumpTrade(trade);
    }

    generateTradeData(length = TradeFactory.DEFAULT_TRADES_COUNT) {
        return Array.from({ length }, () =>
            Array.from({ length: TradeFactory.TRADE_ITEMS_COUNT }, () => {
                return faker.number.float();
            }),
        );
    }
}

export default TradeFactory;
