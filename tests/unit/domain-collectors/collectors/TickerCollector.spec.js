import { faker } from '@faker-js/faker';
import TickerCollector from '../../../../lib/domain-collectors/collectors/TickerCollector.js';

describe('[domain-collectors/collectors]: TickerCollector Tests Suite', () => {
    const exchange = 'binance';
    const symbol = 'BTC/USDT';
    const marketId = faker.number.int();

    const fetchTickerStubResult = {
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

    const context = {};

    beforeEach(() => {
        context.loggerStub = {
            debug: jest.fn(),
            error: jest.fn(),
        };
        context.exchangeAPIStub = {
            fetchTicker: jest.fn().mockResolvedValue(fetchTickerStubResult),
        };
        context.tickerCollector = new TickerCollector({
            logger: context.loggerStub,
            exchange,
            symbol,
            marketId,
            exchangeAPI: context.exchangeAPIStub,
        });

        jest.spyOn(context.tickerCollector, 'publish').mockImplementation(
            () => {},
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetch data should return existing ticker info', async () => {
        const result = await context.tickerCollector.fetchData();

        expect(result).toEqual(fetchTickerStubResult);
        expect(context.exchangeAPIStub.fetchTicker).toHaveBeenCalledTimes(1);
    });

    test('save data should call publish method', async () => {
        await context.tickerCollector.saveData(fetchTickerStubResult);

        expect(context.tickerCollector.publish).toHaveBeenCalledTimes(1);
    });

    test('calls logger if fetch fails', async () => {
        context.exchangeAPIStub.fetchTicker.mockRejectedValue(
            new Error('Test Error'),
        );

        await expect(() => context.tickerCollector.start()).rejects.toThrow();
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
    });
});
