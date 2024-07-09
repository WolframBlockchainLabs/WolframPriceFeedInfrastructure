import Exchange from '#domain-model/entities/Exchange.js';
import dumpExchange from '#use-cases/utils/dumps/dumpExchange.js';
import BaseFactory from './BaseFactory.js';

class ExchangeFactory extends BaseFactory {
    static EXCHANGES = [
        {
            externalExchangeId: 'binance',
            name: 'Binance',
            dataSource: 'binance',
        },
        {
            externalExchangeId: 'kucoin',
            name: 'KuCoin',
            dataSource: 'kucoin',
        },
        {
            externalExchangeId: 'gemini',
            name: 'Gemini',
            dataSource: 'gemini',
        },
        {
            externalExchangeId: 'kraken',
            name: 'Kraken',
            dataSource: 'kraken',
        },
    ];

    async create() {
        const exchangePromises = ExchangeFactory.EXCHANGES.map(
            ({ externalExchangeId, name, dataSource }) => {
                return Exchange.create({
                    externalExchangeId,
                    name,
                    dataSource,
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
