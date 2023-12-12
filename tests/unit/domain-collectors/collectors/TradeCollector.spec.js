import { faker } from '@faker-js/faker';
import TradeCollector from '../../../../lib/domain-collectors/collectors/TradeCollector.js';

describe('[domain-collectors/collectors]: TradeCollector Tests Suite', () => {
    const exchange = 'binance';
    const symbol = 'BTC/USDT';
    const marketId = faker.number.int();

    const collectorMeta = {
        intervalStart: 1702384093936,
        intervalEnd: 1702384693936,
        collectorTraceId: '6771447a',
    };

    const fetchTradeStubResult = [
        {
            side: 'sell',
            price: 0.066754,
            amount: 0.055,
            timestamp: 1684141361369,
        },
    ];

    const fetchedDataMap = [[1, 0.066754, 0.055, 1684141361369]];

    const context = {};

    beforeEach(() => {
        context.loggerStub = {
            debug: jest.fn(),
            error: jest.fn(),
        };

        context.exchangeAPIStub = {
            fetchTrades: jest.fn().mockResolvedValue(fetchTradeStubResult),
            milliseconds: jest.fn().mockResolvedValue(6000),
        };

        context.tradeCollector = new TradeCollector({
            logger: context.loggerStub,
            exchange,
            symbol,
            marketId,
            exchangeAPI: context.exchangeAPIStub,
        });

        jest.spyOn(context.tradeCollector, 'publish').mockImplementation(
            () => {},
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetch data should return existing trade info', async () => {
        const result = await context.tradeCollector.fetchData(collectorMeta);

        expect(result).toEqual(fetchTradeStubResult);
        expect(context.exchangeAPIStub.fetchTrades).toHaveBeenCalledTimes(1);
    });

    test('save data should call publish method', async () => {
        await context.tradeCollector.saveData(
            fetchTradeStubResult,
            collectorMeta,
        );

        expect(context.tradeCollector.publish).toHaveBeenCalledWith(
            {
                tradesInfo: fetchedDataMap,
            },
            collectorMeta,
        );
    });

    test('calls logger if fetch fails', async () => {
        context.exchangeAPIStub.fetchTrades.mockRejectedValue(
            new Error('Test Error'),
        );

        await expect(() =>
            context.tradeCollector.start(collectorMeta),
        ).rejects.toThrow();
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
    });
});
