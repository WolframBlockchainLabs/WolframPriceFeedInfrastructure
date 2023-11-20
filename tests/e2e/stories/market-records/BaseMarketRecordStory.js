import ExchangeFactory from '../../factories/ExchangeFactory.js';
import MarketFactory from '../../factories/MarketFactory.js';
import BaseStory from '../BaseStory.js';

class BaseMarketRecordStory extends BaseStory {
    constructor(...args) {
        super(...args);

        this.exchangeFactory = new ExchangeFactory(this.appProvider);
        this.marketFactory = new MarketFactory(this.appProvider);
    }

    async setupMarkets() {
        const exchanges = await this.exchangeFactory.createExchanges();
        const markets = await this.marketFactory.createMarkets(exchanges);

        return { exchanges, markets };
    }
}

export default BaseMarketRecordStory;
