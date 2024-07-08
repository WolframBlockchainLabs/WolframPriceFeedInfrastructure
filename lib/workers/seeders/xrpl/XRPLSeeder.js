import BaseCryptoConfigSeeder from '../BaseCryptoConfigSeeder.js';

class XRPLSeeder extends BaseCryptoConfigSeeder {
    async execute({ exchange, markets }) {
        return this.setupExchange({
            groupName: exchange.id,
            exchangeConfig: { ...exchange, markets },
        });
    }
}

export default XRPLSeeder;
