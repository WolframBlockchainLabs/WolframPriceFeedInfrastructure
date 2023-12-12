import { faker } from '@faker-js/faker';
import XRPLOrderBookCollector from '../../../../../../lib/domain-collectors/integrations/xrpl/collectors/XRPLOrderBook.js';

describe('[domain-collectors/integrations/xrpl]: XRPLOrderBookCollector Tests Suite', () => {
    const context = {};
    const exchange = 'xrpl';
    const symbol = 'XRP/USD';
    const marketId = faker.number.int();
    const pair = {
        base: {
            currency: 'XRP',
        },
        counter: {
            currency: 'USD',
            issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        },
    };

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

        context.orderBookCollector = new XRPLOrderBookCollector({
            logger: context.loggerStub,
            exchange,
            symbol,
            marketId,
            exchangeAPI: context.exchangeAPIStub,
            pair,
        });

        jest.spyOn(context.orderBookCollector, 'publish');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('fetch data should return existing orderBook info', async () => {
        const result = await context.orderBookCollector.fetchData(
            collectorMeta,
        );

        expect(result).toEqual(fetchOrderBookStubResult);
        expect(context.exchangeAPIStub.fetchOrderBook).toHaveBeenCalledTimes(1);
    });

    test('calls logger if fetch fails', async () => {
        context.exchangeAPIStub.fetchOrderBook.mockRejectedValue(
            new Error('Fetch failed'),
        );

        try {
            await context.orderBookCollector.start(collectorMeta);
        } catch (error) {
            expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        }
    });
});
