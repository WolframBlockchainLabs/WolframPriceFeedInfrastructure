import CollectorsManager from '../../collectors/CollectorsManager.js';
import CandleStickCollector from '../../collectors/models/CandleStick.js';
import OrderBookCollector from '../../collectors/models/OrderBook.js';
import TickerCollector from '../../collectors/models/Ticker.js';
import TradeCollector from '../../collectors/models/Trade.js';
import ccxt from 'ccxt';

function runCollectors({ exchange, symbol, interval, logger }) {
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
    });

    collectorsManager.start();
    setInterval(collectorsManager.start.bind(collectorsManager), interval);
}

export default runCollectors;
