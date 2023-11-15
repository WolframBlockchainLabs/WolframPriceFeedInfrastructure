import ExchangeRateFactory from '../../factories/market-records/ExchangeRateFactory.js';
import BaseMarketRecordStory from './BaseMarketRecordStory.js';

class ExchangeRateStory extends BaseMarketRecordStory {
    constructor(...args) {
        super(...args);

        this.exchangeRateFactory = new ExchangeRateFactory(this.appProvider);
    }

    async setupExchangeRates() {
        const { exchanges, markets } = await this.setupMarkets();
        const exchangeRates =
            await this.exchangeRateFactory.createExchangeRates({ markets });

        return { exchanges, markets, exchangeRates };
    }
}

export default ExchangeRateStory;
