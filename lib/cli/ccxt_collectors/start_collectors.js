import { OrderBookCollector }   from '../../collectors/ccxt/OrderBook.js';
import { TradeCollector }       from '../../collectors/ccxt/Trade.js';
import { TickerCollector }      from '../../collectors/ccxt/Ticker.js';
import { CandleStickCollector } from '../../collectors/ccxt/CandleStick.js';
import { MarketService }        from '../../collectors/MarketService.js';

export default async function startCollectors({ exchange, symbol }) {
    const { marketId } = await new MarketService().getMarketInfo(exchange, symbol);

    const orderBook = new OrderBookCollector({ exchange, symbol, marketId });
    const trade = new TradeCollector({ exchange, symbol, marketId });
    const ticker = new TickerCollector({ exchange, symbol, marketId });
    const candleStick = new CandleStickCollector({ exchange, symbol, marketId });

    return Promise.all([
        orderBook.start(),
        trade.start(),
        ticker.start(),
        candleStick.start()
    ]);
}
