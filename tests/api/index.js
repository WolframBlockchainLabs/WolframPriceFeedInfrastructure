import exchanges from './exchanges/index.js';
import markets from './markets/index.js';
import orderBooks from './order-books/index.js';
import candleSticks from './candle-sticks/index.js';
import tickers from './tickers/index.js';
import trades from './trades/index.js';

export default [
    ...exchanges,
    ...markets,
    ...orderBooks,
    ...candleSticks,
    ...tickers,
    ...trades,
];
