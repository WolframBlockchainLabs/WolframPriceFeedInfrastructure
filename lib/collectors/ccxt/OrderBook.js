import OrderBook from '../../domain-model/entities/OrderBook.js';
import Collector from '../Base.js';

export class OrderBookCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;

        try {
            await exchangeAPI.loadMarkets();

            return await exchangeAPI.fetchOrderBook(symbol);
        } catch (error) {
            this.logger.error(
                `Order books did not receive from ${exchangeAPI.name} for ${symbol} market`,
                error.message,
            );
        }
    }

    async saveData({ bids, asks }, marketId) {
        const { exchange, symbol } = this;

        try {
            const createdOrderBook = await OrderBook.create({
                marketId,
                bids,
                asks,
            });

            this.logger.info(
                `OrderBook data have saved successfully with ${createdOrderBook.id}`,
            );
        } catch (error) {
            this.logger.error(
                `OrderBook did not save for ${exchange} and ${symbol} market`,
                error.message,
            );
        }
    }
}
