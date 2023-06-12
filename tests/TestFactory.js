import { exchangeData, marketData, orderBookData } from './test-data.js';
import Exchange                                    from './../lib/domain-model/Exchange.js';
import Market                                      from './../lib/domain-model/Market.js';
import OrderBook                                   from './../lib/domain-model/OrderBook.js';
// import Trade       from './../lib/domain-model/Trade.js';
// import Ticker      from './../lib/domain-model/Ticker.js';
// import CandleStick from './../lib/domain-model/CandleStick.js';


export default class TestFactory {
    async createExchange() {
        const exchange = await Exchange.create(exchangeData);

        return exchange;
    }

    async createMarket() {
        const { id:exchangeId, name: exchangeName } = await this.createExchange();

        const { id:marketId, symbol } = await Market.create({ ...marketData, exchangeId });

        return { marketId, symbol, exchangeName };
    }

    async createOrderBook() {
        const { marketId, symbol, exchangeName } = await this.createMarket();
        const { bids, asks } = orderBookData;

        const newOrderBook = await OrderBook.create({ marketId, bids, asks });

        return { exchangeName, marketId, symbol, newOrderBook };
    }

    async cleanup() {
        await OrderBook.destroy({ truncate: { cascade: true } });
        await Market.destroy({ truncate: { cascade: true } });
        await Exchange.destroy({ truncate: { cascade: true } });
    }
}
