import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import dumpCandleStick from '../../utils/dumps/dumpCandleStick.js';
import BaseMarketRecordUseCase from '../BaseMarketRecordUseCase.js';

class CandleSticksList extends BaseMarketRecordUseCase {
    async execute(queryParams) {
        const candleSticks = await CandleStick.scope([
            {
                method: ['search', queryParams],
            },
        ]).findAll();

        return {
            data: candleSticks.map(dumpCandleStick),
            meta: {
                fetchCount: candleSticks.length,
            },
        };
    }
}

export default CandleSticksList;
