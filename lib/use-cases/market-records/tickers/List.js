import Ticker from '#domain-model/entities/market-records/Ticker.js';
import dumpTicker from '../../utils/dumps/dumpTicker.js';
import BaseMarketRecordUseCase from '../BaseMarketRecordUseCase.js';

class TickersList extends BaseMarketRecordUseCase {
    async execute(queryParams) {
        const tickers = await Ticker.scope([
            {
                method: ['search', queryParams],
            },
        ]).findAll();

        return {
            data: tickers.map(dumpTicker),
            meta: {
                fetchCount: tickers.length,
            },
        };
    }
}

export default TickersList;
