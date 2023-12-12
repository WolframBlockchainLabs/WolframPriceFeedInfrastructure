// eslint-disable-next-line import/no-unresolved
import { faker } from '@faker-js/faker';
import OrderBookCollector from '../../../../lib/domain-collectors/collectors/OrderBookCollector.js';

describe('[domain-collectors/collectors]: OrderBookCollector Tests Suite', () => {
    const exchange = 'binance';
    const symbol = 'BTC/USDT';
    const marketId = faker.number.int();

    const collectorMeta = {
        intervalStart: 1702384093936,
        intervalEnd: 1702384693936,
        collectorTraceId: '6771447a',
    };

    const fetchOrderBookStubResult = {
        symbol,
        bids: [[faker.number.float()]],
        asks: [[faker.number.float()]],
    };

    const context = {};

    beforeEach(() => {
        context.loggerStub = {
            debug: jest.fn(),
            error: jest.fn(),
        };
        context.exchangeAPIStub = {
            fetchOrderBook: jest
                .fn()
                .mockResolvedValue(fetchOrderBookStubResult),
        };
        context.orderBookCollector = new OrderBookCollector({
            logger: context.loggerStub,
            exchange,
            symbol,
            marketId,
            exchangeAPI: context.exchangeAPIStub,
        });

        jest.spyOn(context.orderBookCollector, 'publish').mockImplementation(
            () => {},
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetch data should return existing orderBook info', async () => {
        const result = await context.orderBookCollector.fetchData(
            collectorMeta,
        );

        expect(result).toEqual(fetchOrderBookStubResult);
        expect(context.exchangeAPIStub.fetchOrderBook).toHaveBeenCalledTimes(1);
    });

    test('save data should call publish method', async () => {
        const { bids, asks } = fetchOrderBookStubResult;

        await context.orderBookCollector.saveData(
            { bids, asks },
            collectorMeta,
        );

        expect(context.orderBookCollector.publish).toHaveBeenCalledTimes(1);
    });

    test('calls logger if fetch fails', async () => {
        context.exchangeAPIStub.fetchOrderBook.mockRejectedValue(
            new Error('Test Error'),
        );

        await expect(() =>
            context.orderBookCollector.start(collectorMeta),
        ).rejects.toThrow();
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
    });
});
