/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */
import Base     from './../Base.js';
import Exchange from './../../domain-model/Exchange.js';
// import Market   from './../../domain-model/Market.js';

const exchanges = [
    {
        externalExchangeId : 'binance',
        name               : 'Binance'
    },
    {
        externalExchangeId : 'kucoin',
        name               : 'KuCoin'
    },
    {
        externalExchangeId : 'gemini',
        name               : 'Gemini'
    },
    {
        externalExchangeId : 'kraken',
        name               : 'Kraken'
    },
    {
        externalExchangeId : 'bitfinex',
        name               : 'Bitfinex'
    }
];

// const market = {
//     externalMarketId : 'BTCUSDT',
//     symbol           : 'BTC/USDT',
//     base             : 'BTC',
//     quote            : 'USDT',
//     baseId           : 'BTC',
//     quoteId          : 'USDT',
//     active           : true,
//     exchangeId       : 18
// };


export default class DatabaseImport extends Base {
    static validationRules = {};

    async execute() {
        for (const exchange of exchanges) {
            await Exchange.create({ externalExchangeId: exchange.externalExchangeId, name: exchange.name });
        }

        // await Market.create({ ...market });


        this.info('Done');

        return {};
    }
}
