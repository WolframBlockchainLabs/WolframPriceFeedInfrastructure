import * as xrpl from 'xrpl';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

class XRPLDriver {
    constructor(serverURL) {
        this.client = new xrpl.Client(serverURL);
    }

    async connect() {
        if (!this.client.isConnected()) {
            await this.client.connect();
        }
    }

    async disconnect() {
        await this.client.disconnect();
    }

    async fetchOrderBook(pair) {
        await this.connect();

        const bookOffers = await this.loadOrders(pair);

        return {
            bids: this.processOrders(bookOffers.bids, true),
            asks: this.processOrders(bookOffers.asks, false),
        };
    }

    async loadOrders(pair) {
        try {
            const asksOrderBook = await this.requestBookOffers(
                pair.counter,
                pair.base,
            );
            const bidsOrderBook = await this.requestBookOffers(
                pair.base,
                pair.counter,
            );

            return {
                asks: asksOrderBook.result.offers,
                bids: bidsOrderBook.result.offers,
            };
        } catch (error) {
            if (this.verifyRateLimitError(error)) {
                throw new RateLimitExceededException();
            }

            throw error;
        }
    }

    verifyRateLimitError(error) {
        return error instanceof xrpl.TimeoutError;
    }

    async requestBookOffers(takerGets, takerPays) {
        return this.client.request({
            command: 'book_offers',
            taker_gets: takerGets,
            taker_pays: takerPays,
        });
    }

    processOrders(orders, isBids) {
        const processedOrders = orders.map((order) => {
            const price = parseFloat(order.quality);
            const amount = parseFloat(
                isBids ? order.TakerPays.value : order.TakerGets.value,
            );
            return [price, amount];
        });

        return processedOrders.sort((a, b) =>
            isBids ? b[0] - a[0] : a[0] - b[0],
        );
    }
}

export default XRPLDriver;
