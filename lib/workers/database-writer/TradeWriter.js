import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import Trade from '../../domain-model/entities/market-records/Trade.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class TradeWriter extends BaseAMQPWorker {
    SequelizeModel = Trade;

    type = COLLECTOR_TYPES_DICT.TRADE;
}

export default TradeWriter;
