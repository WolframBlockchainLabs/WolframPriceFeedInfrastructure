import TradeFactory from '../../factories/market-records/TradeFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class TradeStory extends BaseMarketRecordStory {
    constructor(options) {
        super(options);

        this.marketRecordFactory = new TradeFactory(this);
    }
}

export default TradeStory;
