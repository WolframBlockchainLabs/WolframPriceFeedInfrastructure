import OrderBookFactory from '../../factories/market-records/OrderBookFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class OrderBookStory extends BaseMarketRecordStory {
    constructor(options) {
        super(options);

        this.marketRecordFactory = new OrderBookFactory(this);
    }
}

export default OrderBookStory;
