import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import Ticker from '../../domain-model/entities/market-records/Ticker.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class TickerWriter extends BaseAMQPWorker {
    SequelizeModel = Ticker;

    type = COLLECTOR_TYPES_DICT.TICKER;
}

export default TickerWriter;
