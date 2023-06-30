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
    interval,
    logger,
    amqpClient,
}) {
    const exchangeAPI = new ccxt[exchange]();

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
        interval,
    });

    await collectorsManager.init();
    await collectorsManager.start();
}

export default runCollectors;
