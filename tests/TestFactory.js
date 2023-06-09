import { faker } from '@faker-js/faker';
import Exchange from './../lib/domain-model/Exchange.js';
// import Market    from './../lib/domain-model/Market.js';
// import OrderBook   from './../lib/domain-model/OrderBook.js';
// import Trade       from './../lib/domain-model/Trade.js';
// import Ticker      from './../lib/domain-model/Ticker.js';
// import CandleStick from './../lib/domain-model/CandleStick.js';

const exchangeData = {
    externalExchangeId : faker.word.noun(),
    name               : faker.word.noun()
};

// const markeData = {
//     externalMarketId : faker.word.noun(),
//     symbol           : faker.word.noun(),
//     base             : faker.word.noun(),
//     quote            : faker.word.noun(),
//     baseId           : faker.word.noun(),
//     quoteId          : faker.word.noun(),
//     active: faker.datatype.boolean()
// };

export default class TestFactory {
    async createExchange() {
        const exchange = await Exchange.create(exchangeData);

        return exchange;
    }

    // async createMarket() {
    //     const { exchangeId } = await Exchange.create(exchangeData);

    //     await Market.create({ exchangeId });
    // }

    async cleanup() {
        await Exchange.destroy({ where: {} });
    }
}
