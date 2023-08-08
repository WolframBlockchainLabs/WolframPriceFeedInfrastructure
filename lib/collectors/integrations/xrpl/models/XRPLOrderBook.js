import OrderBookCollector from '../../../models/OrderBook.js';

class XRPLOrderBookCollector extends OrderBookCollector {
    constructor({ pair, ...collectorOptions }) {
        super(collectorOptions);

        this.pair = pair;
    }

    async fetchData() {
        const { exchange, exchangeAPI, symbol, pair } = this;

        try {
            return await exchangeAPI.fetchOrderBook(pair);
        } catch (error) {
            this.logger.error({
                message: `Could not get OrderBook for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }
}

export default XRPLOrderBookCollector;
