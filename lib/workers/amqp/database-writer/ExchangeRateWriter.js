import { COLLECTOR_TYPES_DICT } from '#constants/collectors/collector-types.js';
import ExchangeRate from '#domain-model/entities/market-records/ExchangeRate.js';
import BaseMarketRecordWriter from './BaseMarketRecordWriter.js';

class ExchangeRateWriter extends BaseMarketRecordWriter {
    SequelizeModel = ExchangeRate;

    type = COLLECTOR_TYPES_DICT.EXCHANGE_RATE;
}

export default ExchangeRateWriter;
