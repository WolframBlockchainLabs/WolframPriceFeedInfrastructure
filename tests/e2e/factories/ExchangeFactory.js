import Exchange from '#domain-model/entities/Exchange.js';
import dumpExchange from '#use-cases/utils/dumps/dumpExchange.js';
import BaseFactory from './BaseFactory.js';

class ExchangeFactory extends BaseFactory {
    static EXCHANGES = [
        {
            externalExchangeId: 'binance',
            name: 'Binance',
        },
        {
            externalExchangeId: 'kucoin',
            name: 'KuCoin',
        },
        {
            externalExchangeId: 'gemini',
            name: 'Gemini',
        },
        {
            externalExchangeId: 'kraken',
            name: 'Kraken',
        },
    ];

    async createExchanges() {
        const exchangePromises = ExchangeFactory.EXCHANGES.map(
            ({ externalExchangeId, name }) => {
                return Exchange.create({
                    externalExchangeId,
                    name,
                });
            },
        );

        const exchanges = await Promise.all(exchangePromises);

        return exchanges.map((exchange) => {
            return dumpExchange(exchange);
        });
    }

    async bulkCreate(data) {
        return Exchange.bulkCreate(data);
    }
}

export default ExchangeFactory;
