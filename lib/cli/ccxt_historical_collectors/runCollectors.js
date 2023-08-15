import HistoricalManager from '../../collectors/HistoricalManager.js';
import CandleStickCollector from '../../collectors/models/CandleStick.js';
import TradeCollector from '../../collectors/models/Trade.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';

async function runCollectors({
    scheduleStartDate,
    scheduleEndDate,
    exchange,
    symbol,
    queuePosition,
    queueSize,
    defaultRateLimit,
    enforcedRateLimit,
    rateLimitMargin,
    logger,
    amqpClient,
}) {
    const exchangeAPI = new ccxt[exchange]();
    const rateLimit =
        enforcedRateLimit ?? exchangeAPI.rateLimit ?? defaultRateLimit;

    const collectorsManager = new HistoricalManager({
        models: [CandleStickCollector, TradeCollector],
        logger,
        exchange,
        symbol,
        exchangeAPI,
        amqpClient,
        rateLimit,
        rateLimitMargin,
        queuePosition,
        queueSize,
        scheduleStartDate,
        scheduleEndDate,
    });

    await collectorsManager.start();
}

export default runCollectors;
