import TradeFactory from '../../factories/market-records/TradeFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class TradeStory extends BaseMarketRecordStory {
    constructor(...args) {
        super(...args);

        this.tradeFactory = new TradeFactory(this.appProvider);
    }

    async setupTrades() {
        const { exchanges, markets } = await this.setupMarkets();
        const trades = await this.tradeFactory.createTrades({
            markets,
        });

        return { exchanges, markets, trades };
    }
}

export default TradeStory;
