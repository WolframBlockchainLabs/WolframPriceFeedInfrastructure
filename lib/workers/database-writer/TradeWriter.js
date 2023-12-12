import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import Trade from '../../domain-model/entities/market-records/Trade.js';
import BaseMarketRecordWriter from './BaseMarketRecordWriter.js';

class TradeWriter extends BaseMarketRecordWriter {
    SequelizeModel = Trade;

    type = COLLECTOR_TYPES_DICT.TRADE;
}

export default TradeWriter;
