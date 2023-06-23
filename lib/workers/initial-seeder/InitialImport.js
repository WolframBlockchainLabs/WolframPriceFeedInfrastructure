import BaseWorker from '../BaseWorker.js';
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

export default class InitialImport extends BaseWorker {
    async execute() {
        for (const exchange of exchanges) {
            await Exchange.create({
                externalExchangeId: exchange.externalExchangeId,
                name: exchange.name,
            });
        }
    }
}
