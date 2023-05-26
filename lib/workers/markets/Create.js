import Base   from './../Base.js';
import Market from './../../domain-model/Market.js';

const market = {
    externalMarketId : 'BTCUSDT',
    symbol           : 'BTC/USDT',
    base             : 'BTC',
    quote            : 'USDT',
    baseId           : 'BTC',
    quoteId          : 'USDT',
    active           : true,
    exchangeId       : 1
};


export default class MarketCreate extends Base {
    static validationRules = {
        externalMarketId : [ 'required', 'string' ],
        symbol           : [ 'required', 'string' ],
        base             : [ 'required', 'string' ],
        quote            : [ 'required', 'string' ],
        baseId           : [ 'required', 'string' ],
        quoteId          : [ 'required', 'string' ],
        active           : [ 'required', 'Boolean' ],
        exchangeId       : [ 'required', 'integer' ]

    };

    async execute() {
        await Market.create({ ...market });

        return {};
    }
}
