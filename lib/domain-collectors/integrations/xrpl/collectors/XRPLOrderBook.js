import OrderBookCollector from '../../../collectors/OrderBookCollector.js';

class XRPLOrderBookCollector extends OrderBookCollector {
    async fetchData() {
        const { exchangeAPI, pair } = this;

        return exchangeAPI.fetchOrderBook(pair);
    }
}

export default XRPLOrderBookCollector;
