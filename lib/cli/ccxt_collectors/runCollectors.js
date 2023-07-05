import CollectorsManager from '../../collectors/CollectorsManager.js';
import CandleStickCollector from '../../collectors/models/CandleStick.js';
import OrderBookCollector from '../../collectors/models/OrderBook.js';
import TickerCollector from '../../collectors/models/Ticker.js';
import TradeCollector from '../../collectors/models/Trade.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';

async function runCollectors({
    exchange,
    symbol,
    queuePosition,
    queueSize,
    replicaSize,
    instancePosition,
    defaultRateLimit,
    enforcedRateLimit,
    logger,
    amqpClient,
}) {
    const exchangeAPI = new ccxt[exchange]();
    const rateLimit =
        enforcedRateLimit ?? exchangeAPI.rateLimit ?? defaultRateLimit;

    const collectorsManager = new CollectorsManager({
        models: [
            CandleStickCollector,
            OrderBookCollector,
            TickerCollector,
            TradeCollector,
        ],
        logger,
        exchange,
        symbol,
        exchangeAPI,
        amqpClient,
        rateLimit,
        queuePosition,
        queueSize,
        replicaSize,
        instancePosition,
    });

    await collectorsManager.start();
}

export default runCollectors;
