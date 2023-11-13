import { faker } from '@faker-js/faker';
import OrderBook from '../../../lib/domain-model/entities/market-records/OrderBook.js';
import Trade from '../../../lib/domain-model/entities/market-records/Trade.js';
import Ticker from '../../../lib/domain-model/entities/market-records/Ticker.js';
import CandleStick from '../../../lib/domain-model/entities/market-records/CandleStick.js';
import ExchangeRate from '../../../lib/domain-model/entities/market-records/ExchangeRate.js';

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
    {
        externalExchangeId: 'bitfinex',
        name: 'Bitfinex',
    },
];

export const marketsData = [
    'BTC/EUR',
    'BTC/USDT',
    'ETH/USDT',
    'ETH/EUR',
    'LTC/BTC',
].map((symbol) => ({
    externalMarketId: faker.word.noun(Math.floor(Math.random() * 10)),
    symbol,
    base: faker.word.noun(Math.floor(Math.random() * 5)),
    quote: faker.word.noun(Math.floor(Math.random() * 5)),
    baseId: faker.word.noun(Math.floor(Math.random() * 5)),
    quoteId: faker.word.noun(Math.floor(Math.random() * 5)),
    active: faker.datatype.boolean(),
    intervalStart: '2023-09-14 12:00:00+0000',
    intervalEnd: '2023-09-14 12:00:00+0000',
}));

export function generateOrderBookData(length = 3) {
    return Array.from({ length }, (item, index) => ({
        bids: [[faker.number.float()], [faker.number.float()]],
        asks: [[faker.number.float()], [faker.number.float()]],
        intervalStart:
            Date.parse('2023-09-14 12:00:00+0000') + index * 1000 * 60,
        intervalEnd:
            Date.parse('2023-09-14 12:00:00+0000') + (index + 1) * 1000 * 60,
    }));
}

export function generateExchangeRateData(length = 3) {
    return Array.from({ length }, (item, index) => ({
        poolASize: faker.number.float(),
        poolBSize: faker.number.float(),
        exchangeRate: faker.number.float(),
        intervalStart:
            Date.parse('2023-09-14 12:00:00+0000') + index * 1000 * 60,
        intervalEnd:
            Date.parse('2023-09-14 12:00:00+0000') + (index + 1) * 1000 * 60,
    }));
}

export function generateCandleStickData(length = 3) {
    return Array.from({ length }, (item, index) => ({
        charts: [Array.from({ length: 5 }, () => faker.number.float())],
        intervalStart:
            Date.parse('2023-09-14 12:00:00+0000') + index * 1000 * 60,
        intervalEnd:
            Date.parse('2023-09-14 12:00:00+0000') + (index + 1) * 1000 * 60,
    }));
}

export function generateTradeData(length = 3) {
    return Array.from({ length }, (item, index) => ({
        tradesInfo: [Array.from({ length: 4 }, () => faker.number.float())],
        intervalStart:
            Date.parse('2023-09-14 12:00:00+0000') + index * 1000 * 60,
        intervalEnd:
            Date.parse('2023-09-14 12:00:00+0000') + (index + 1) * 1000 * 60,
    }));
}

export function generateTickerData(length = 3) {
    return Array.from({ length }, (item, index) => ({
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
        intervalStart:
            Date.parse('2023-09-14 12:00:00+0000') + index * 1000 * 60,
        intervalEnd:
            Date.parse('2023-09-14 12:00:00+0000') + (index + 1) * 1000 * 60,
    }));
}

export function getCollectorsMetaInfos(markets, size) {
    return [
        {
            markets,
            rawData: generateCandleStickData(size),
            Model: CandleStick,
        },
        {
            markets,
            rawData: generateExchangeRateData(size),
            Model: ExchangeRate,
        },
        {
            markets,
            rawData: generateOrderBookData(size),
            Model: OrderBook,
        },
        {
            markets,
            rawData: generateTickerData(size),
            Model: Ticker,
        },
        {
            markets,
            rawData: generateTradeData(size),
            Model: Trade,
        },
    ];
}
