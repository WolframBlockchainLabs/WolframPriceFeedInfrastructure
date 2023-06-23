import ccxt from 'ccxt';
import { OrderBookCollector } from '../../collectors/ccxt/OrderBook.js';
import { TradeCollector } from '../../collectors/ccxt/Trade.js';
import { TickerCollector } from '../../collectors/ccxt/Ticker.js';
import { CandleStickCollector } from '../../collectors/ccxt/CandleStick.js';
import MarketService from '../../collectors/MarketService.js';

async function startCollectors({ logger, exchange, symbol }) {
    const exchangeAPI = new ccxt[exchange]();

    const { marketId } = await new MarketService({
        logger,
        exchangeAPI,
    }).getMarketInfo(exchange, symbol);

    const orderBook = new OrderBookCollector({
        logger,
        exchange,
        symbol,
        marketId,
        exchangeAPI,
    });

    const trade = new TradeCollector({
        logger,
        exchange,
        symbol,
        marketId,
        exchangeAPI,
    });

    const ticker = new TickerCollector({
        logger,
        exchange,
        symbol,
        marketId,
        exchangeAPI,
    });

    const candleStick = new CandleStickCollector({
        logger,
        exchange,
        symbol,
        marketId,
        exchangeAPI,
    });

    return Promise.all([
        orderBook.start(),
        trade.start(),
        ticker.start(),
        candleStick.start(),
    ]);
}

export default startCollectors;
