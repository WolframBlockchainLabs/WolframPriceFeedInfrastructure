import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import CandleStick from '../../domain-model/entities/market-records/CandleStick.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class CandleStickWriter extends BaseAMQPWorker {
    SequelizeModel = CandleStick;

    type = COLLECTOR_TYPES_DICT.CANDLE_STICK;
}

export default CandleStickWriter;
