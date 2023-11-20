import OrderBookFactory from '../../factories/market-records/OrderBookFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class OrderBookStory extends BaseMarketRecordStory {
    constructor(...args) {
        super(...args);

        this.orderBookFactory = new OrderBookFactory(this.appProvider);
    }

    async setupOrderBooks() {
        const { exchanges, markets } = await this.setupMarkets();
        const orderBooks = await this.orderBookFactory.createOrderBooks({
            markets,
        });

        return { exchanges, markets, orderBooks };
    }
}

export default OrderBookStory;
