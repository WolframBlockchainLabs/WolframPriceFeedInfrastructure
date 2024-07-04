import ExchangeRateFactory from '../../factories/market-records/ExchangeRateFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class ExchangeRateStory extends BaseMarketRecordStory {
    constructor(options) {
        super(options);

        this.marketRecordFactory = new ExchangeRateFactory(this);
    }
}

export default ExchangeRateStory;
