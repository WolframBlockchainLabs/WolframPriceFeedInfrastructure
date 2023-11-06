import { faker } from '@faker-js/faker';

export const exchangeData = [
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

export function fakeMarketsData(amount = 4) {
    return Array.from(new Array(amount)).map((_, i) => ({
        externalMarketId: faker.word.noun(Math.floor(Math.random() * 10)),
        symbol: 'BTC/USDT',
        base: 'BTC',
        quote: 'USDT',
        baseId: `BTC${i}`,
        quoteId: `USDT${i}`,
        active: faker.datatype.boolean(),
    }));
}

export const orderBookData = {
    bids: [[faker.number.float()], [faker.number.float()]],
    asks: [[faker.number.float()], [faker.number.float()]],
};

export const exchangeRateData = {
    poolASize: faker.number.float(),
    poolBSize: faker.number.float(),
    exchangeRate: faker.number.float(),
};

export function generateCandleStickData(length = 3) {
    return Array.from({ length }, () =>
        Array.from({ length: 5 }, () => faker.number.float()),
    );
}

export function generateTradeData(length = 3) {
    return Array.from({ length }, () =>
        Array.from({ length: 4 }, () => faker.number.float()),
    );
}

export const tickerData = {
    high: faker.number.float(),
    low: faker.number.float(),
    bid: faker.number.float(),
    bidVolume: faker.number.float(),
    ask: faker.number.float(),
    askVolume: faker.number.float(),
    vwap: faker.number.float(),
    open: faker.number.float(),
    close: faker.number.float(),
    last: faker.number.float(),
    previousClose: faker.number.float(),
    change: faker.number.float(),
    percentage: faker.number.float(),
    average: faker.number.float(),
    baseVolume: faker.number.float(),
    quoteVolume: faker.number.float(),
};
