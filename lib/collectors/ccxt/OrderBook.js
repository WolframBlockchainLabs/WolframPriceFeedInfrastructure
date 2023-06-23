import OrderBook from '../../domain-model/entities/OrderBook.js';
import BaseCollector from '../BaseCollector.js';

class OrderBookCollector extends BaseCollector {
    async fetchData() {
        const { exchange, exchangeAPI, symbol } = this;

        try {
            await exchangeAPI.loadMarkets();

            return await exchangeAPI.fetchOrderBook(symbol);
        } catch (error) {
            this.logger.error({
                message: `Could not get OrderBook for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData({ bids, asks }, marketId) {
        const { exchange, symbol } = this;

        try {
            await OrderBook.create({
                marketId,
                bids,
                asks,
            });

            this.logger.info(
                `OrderBook for '${exchange} & ${symbol}' have been saved successfully`,
            );
        } catch (error) {
            this.logger.error({
                message: `Could not save OrderBook for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }
}

export default OrderBookCollector;
