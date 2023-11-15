import TickerFactory from '../../factories/market-records/TickerFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class TickerStory extends BaseMarketRecordStory {
    constructor(...args) {
        super(...args);

        this.tickerFactory = new TickerFactory(this.appProvider);
    }

    async setupTickers() {
        const { exchanges, markets } = await this.setupMarkets();
        const tickers = await this.tickerFactory.createTickers({
            markets,
        });

        return { exchanges, markets, tickers };
    }
}

export default TickerStory;
