import Base from './../Base.js';
import Exchange from '../../domain-model/entities/Exchange.js';

const exchanges = [
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
    {
        externalExchangeId: 'bitfinex',
        name: 'Bitfinex',
    },
];

export default class DatabaseImport extends Base {
    static validationRules = {};

    async execute() {
        for (const exchange of exchanges) {
            await Exchange.create({
                externalExchangeId: exchange.externalExchangeId,
                name: exchange.name,
            });
        }

        this.info('Done');

        return {};
    }
}
