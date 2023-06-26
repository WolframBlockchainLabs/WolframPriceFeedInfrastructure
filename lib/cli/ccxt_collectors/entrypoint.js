import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import CollectorsManager from '../../collectors/CollectorsManager.js';
import CandleStickCollector from '../../collectors/models/CandleStick.js';
import OrderBookCollector from '../../collectors/models/OrderBook.js';
import TickerCollector from '../../collectors/models/Ticker.js';
import TradeCollector from '../../collectors/models/Trade.js';
import ccxt from 'ccxt';
import './options_schema.js';

function entrypoint({ exchange, symbol, interval, logger }) {
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

const provider = new AppCliProvider(async () => {
    const { exchange, symbol, interval } = program.opts();
    const desyncTimeout = Math.floor(Math.random() * (interval / 2));

    setTimeout(() => {
        entrypoint({ exchange, symbol, interval, logger: provider.logger });
    }, desyncTimeout);
});

provider.start();
