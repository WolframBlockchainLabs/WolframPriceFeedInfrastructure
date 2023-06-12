import { faker } from '@faker-js/faker';

export const exchangeData = {
    externalExchangeId : faker.word.noun(),
    name               : faker.word.noun()
};

export const marketData = {
    externalMarketId : faker.word.noun(),
    symbol           : faker.word.noun(),
    base             : faker.word.noun(),
    quote            : faker.word.noun(),
    baseId           : faker.word.noun(),
    quoteId          : faker.word.noun(),
    active           : faker.datatype.boolean()
};

export const orderBookData = {
    bids : [ [ faker.number.float() ], [ faker.number.float() ] ],
    asks : [ [ faker.number.float() ], [ faker.number.float() ] ]
};
