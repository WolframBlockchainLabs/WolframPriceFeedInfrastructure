import TickerFactory from '../../factories/market-records/TickerFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class TickerStory extends BaseMarketRecordStory {
    constructor(options) {
        super(options);

        this.marketRecordFactory = new TickerFactory(this);
    }
}

export default TickerStory;
