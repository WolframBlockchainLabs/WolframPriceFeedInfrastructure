import exchanges  from './exchanges/index.js';
import orderBooks from './orderBooks/index.js';
// import candleSticks from './candleSticks/index.js';
// import tickers      from './tickers/index.js';
// import trades       from './trades/index.js';

export default [
    ...exchanges,
    ...orderBooks
    // ...candleSticks,
    // ...tickers,
    // ...trades
];
