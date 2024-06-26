import CandleStickFactory from '../../factories/market-records/CandleStickFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class CandleStickStory extends BaseMarketRecordStory {
    constructor(...args) {
        super(...args);

        this.candleStickFactory = new CandleStickFactory(this.appProvider);
    }

    async setupCandleSticks({ recordsCount, chartsCount } = {}) {
        const { exchanges, markets } = await this.setupMarkets();
        const candleSticks = await this.candleStickFactory.createCandleSticks({
            markets,
            recordsCount,
            chartsCount,
        });

        return { exchanges, markets, candleSticks };
    }
}

export default CandleStickStory;
