import candleStickFetch from './candleStick.js';
import orderBookFetch from './orderBook.js';
import tickerFetch from './ticker.js';
import tradeFetch from './trade.js';

const datatypeFetchers = {
    CandleStick: candleStickFetch,
    OrderBook: orderBookFetch,
    Ticker: tickerFetch,
    Trade: tradeFetch,
};

export default datatypeFetchers;
