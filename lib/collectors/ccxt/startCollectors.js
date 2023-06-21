import { OrderBookCollector }   from './OrderBook.js';
import { TradeCollector }       from './Trade.js';
import { TickerCollector }      from './Ticker.js';
import { CandleStickCollector } from './CandleStick.js';

export default async function startCollectors({ exchange, symbol, marketService, sequelize }) {
    const collectors = [];

    const { marketId } = await marketService.getMarketInfo(exchange, symbol);

    const orderBook = new OrderBookCollector(
        { exchange, symbol },
        sequelize,
        marketId
    );

    const trade = new TradeCollector(
        { exchange, symbol },
        sequelize,
        marketId
    );

    const ticker = new TickerCollector(
        { exchange, symbol },
        sequelize,
        marketId
    );

    const candleStick = new CandleStickCollector(
        { exchange, symbol },
        sequelize,
        marketId
    );

    collectors.push(
        orderBook.start(),
        trade.start(),
        ticker.start(),
        candleStick.start()
    );

    return Promise.all(collectors);
}
