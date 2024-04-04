import { COLLECTOR_TYPES_DICT } from '#constants/collectorTypes.js';
import Ticker from '#domain-model/entities/market-records/Ticker.js';
import BaseMarketRecordWriter from './BaseMarketRecordWriter.js';

class TickerWriter extends BaseMarketRecordWriter {
    SequelizeModel = Ticker;

    type = COLLECTOR_TYPES_DICT.TICKER;
}

export default TickerWriter;
