import Trade from '#domain-model/entities/market-records/Trade.js';
import dumpTrade from '../../utils/dumps/dumpTrade.js';
import BaseMarketRecordUseCase from '../BaseMarketRecordUseCase.js';

class TradesList extends BaseMarketRecordUseCase {
    async execute(queryParams) {
        const trades = await Trade.scope([
            {
                method: ['search', queryParams],
            },
        ]).findAll();

        return {
            data: trades.map(dumpTrade),
            meta: {
                fetchCount: trades.length,
            },
        };
    }
}

export default TradesList;
