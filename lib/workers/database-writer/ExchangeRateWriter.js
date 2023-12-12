import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import ExchangeRate from '../../domain-model/entities/market-records/ExchangeRate.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class ExchangeRateWriter extends BaseAMQPWorker {
    SequelizeModel = ExchangeRate;

    type = COLLECTOR_TYPES_DICT.EXCHANGE_RATE;
}

export default ExchangeRateWriter;
