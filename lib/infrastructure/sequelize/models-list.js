import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import OrderBook from '#domain-model/entities/market-records/OrderBook.js';
import Trade from '#domain-model/entities/market-records/Trade.js';
import Ticker from '#domain-model/entities/market-records/Ticker.js';
import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import ExchangeRate from '#domain-model/entities/market-records/ExchangeRate.js';
import AggregationTask from '#domain-model/entities/AggregationTask.js';
import DiscreteAggregationExchange from '#domain-model/entities/DiscreteAggregationExchange.js';
import DiscreteAggregationResult from '#domain-model/entities/DiscreteAggregationResult.js';

const MODELS_LIST = [
    Exchange,
    Market,
    OrderBook,
    Trade,
    Ticker,
    CandleStick,
    ExchangeRate,

    AggregationTask,
    DiscreteAggregationExchange,
    DiscreteAggregationResult,
];

export default MODELS_LIST;
