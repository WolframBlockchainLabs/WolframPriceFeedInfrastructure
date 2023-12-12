import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import CandleStick from '../../domain-model/entities/market-records/CandleStick.js';
import BaseMarketRecordWriter from './BaseMarketRecordWriter.js';

class CandleStickWriter extends BaseMarketRecordWriter {
    SequelizeModel = CandleStick;

    type = COLLECTOR_TYPES_DICT.CANDLE_STICK;
}

export default CandleStickWriter;
