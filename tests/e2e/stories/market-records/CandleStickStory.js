import CandleStickFactory from '../../factories/market-records/CandleStickFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class CandleStickStory extends BaseMarketRecordStory {
    constructor(options) {
        super(options);

        this.marketRecordFactory = new CandleStickFactory(this);
    }
}

export default CandleStickStory;
