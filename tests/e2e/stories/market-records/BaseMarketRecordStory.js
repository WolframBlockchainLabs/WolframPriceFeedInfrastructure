import ExchangeFactory from '../../factories/ExchangeFactory.js';
import MarketFactory from '../../factories/MarketFactory.js';
import BaseStory from '../BaseStory.js';

class BaseMarketRecordStory extends BaseStory {
    constructor(options) {
        super(options);

        this.exchangeFactory = new ExchangeFactory(this);
        this.marketFactory = new MarketFactory(this);

        this.marketRecordFactory = null;
    }

    async setupMarkets() {
        const exchanges = await this.exchangeFactory.create();
        const markets = await this.marketFactory.create(exchanges);

        return { exchanges, markets };
    }

    async setup() {
        const { exchanges, markets } = await this.setupMarkets();
        const marketRecords = await this.marketRecordFactory.create({
            markets,
        });

        return { exchanges, markets, marketRecords };
    }
}

export default BaseMarketRecordStory;
