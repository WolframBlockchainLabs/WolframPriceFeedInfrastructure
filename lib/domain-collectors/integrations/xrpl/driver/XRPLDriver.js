import * as xrpl from 'xrpl';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

class XRPLDriver {
    constructor(serverURL) {
        this.client = new xrpl.Client(serverURL);
    }

    async connect() {
        await this.client.connect();
    }

    async disconnect() {
        await this.client.disconnect();
    }

    async loadOrders(pair) {
        try {
            const asksOrderBook = await this.client.request({
                command: 'book_offers',
                taker_gets: pair.counter,
                taker_pays: pair.base,
            });

            const bidsOrderBook = await this.client.request({
                command: 'book_offers',
                taker_gets: pair.base,
                taker_pays: pair.counter,
            });

            return {
                asks: asksOrderBook.result.offers,
                bids: bidsOrderBook.result.offers,
            };
        } catch (error) {
            if (error instanceof xrpl.TimeoutError) {
                throw new RateLimitExceededException();
            }

            throw error;
        }
    }

    async fetchOrderBook(pair) {
        const bookOffers = await this.loadOrders(pair);

        const bids = [];
        const asks = [];

        for (let order of bookOffers.bids) {
            const price = parseFloat(order.quality);
            const amount = parseFloat(order.TakerPays.value);

            bids.push([price, amount]);
        }

        for (let order of bookOffers.asks) {
            const price = parseFloat(order.quality);
            const amount = parseFloat(order.TakerGets.value);

            asks.push([price, amount]);
        }

        return {
            bids: bids.sort((a, b) => b[0] - a[0]),
            asks: asks.sort((a, b) => a[0] - b[0]),
        };
    }
}

export default XRPLDriver;
